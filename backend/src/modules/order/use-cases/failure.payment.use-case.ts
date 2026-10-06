import { inject, injectable } from "tsyringe";
import type { IHandlePaymentFailureUseCase } from "./interfaces/failure.payment.use-case.interface.js";
import type { IPaymentRepository } from "../../payment/repositories/payment.repository.interface.js";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { ICartRepository } from "../../cart/repositories/cart.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { HandlePaymentFailureRequestDto } from "../dtos/failure.order.dto.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import mongoose from "mongoose";
import type { IEmailService } from "../../../core/ports/email.service.interface.js";

@injectable()
export class HandlePaymentFailureUseCase
    implements IHandlePaymentFailureUseCase {

    constructor(
        @inject("IPaymentRepository")
        private readonly _paymentRepository: IPaymentRepository,

        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository,

        @inject("ICartRepository")
        private readonly _cartRepository: ICartRepository,

        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository,

        @inject("IEmailService")
        private readonly _emailService: IEmailService,
    ) { }

    async execute(dto: HandlePaymentFailureRequestDto): Promise<void> {


        //LOAD PAYMENT BY PROVIDER ORDER ID

        const payment = await this._paymentRepository.findByProviderOrderId(
            dto.razorpay_order_id
        );

        if (!payment) {
            throw new CustomError(
                ResponseMessages.PAYMENT_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }

        // STEP 2 — IDEMPOTENCY CHECK
        // If already failed or cancelled, exit safely

        if (payment.status === "failed") {
            return;
        }

        //if payment is already captured
        if (payment.status === "captured") {
            throw new CustomError(
                ResponseMessages.PAYMENT_ALREADY_CAPTURED,
                HttpStatusCode.BAD_REQUEST
            );
        }

        // STEP 3 — LOAD ORDER

        const order = await this._orderRepository.findById(payment.orderId);

        if (!order) {
            throw new CustomError(
                ResponseMessages.ORDER_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }

        if (order.orderStatus === "cancelled") {
            return;
        }

        // STEP 4 — START DB TRANSACTION

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            // STEP 5 — RESTORE STOCK (CRITICAL)

            for (const item of order.items) {

                const product = await this._productRepository.findById(
                    item.productId,
                    session
                );

                if (!product) {
                    throw new CustomError(
                        ResponseMessages.PRODUCT_NOT_FOUND,
                        HttpStatusCode.NOT_FOUND
                    );
                }

                const variant = product.variants.find(
                    (v) => v.id === item.variantId
                );

                if (!variant) {
                    throw new CustomError(
                        ResponseMessages.PRODUCT_VARIANT_NOT_FOUND,
                        HttpStatusCode.NOT_FOUND
                    );
                }

                await this._productRepository.incrementStock({
                    productId: product.id!,
                    variantId: variant.id!,
                    quantity: item.quantity,
                    session,
                });
            }

            // STEP 6 — UPDATE PAYMENT STATUS
            await this._paymentRepository.failPayment({
                paymentId: payment.id!,
                reason: dto.failure_reason ?? "Payment failed",
                providerPaymentId: dto.razorpay_payment_id!,
                session,
            });

            // STEP 7 — CANCEL ORDER 
            await this._orderRepository.cancelOrder(order.id!, session);

            // STEP 8 — COMMIT TRANSACTION
            await session.commitTransaction();

            const reason = dto.failure_reason ?? "Payment failed";

            this._emailService
                .sendOrderStatusUpdate({
                    to: order.userSnapshot.email,
                    orderNumber: order.orderNumber,
                    status: "cancelled",
                    customerName: order.userSnapshot.name,
                    title: "Order Cancelled",
                })
                .catch((error) =>
                    console.error(`Failed to send order-cancelled email for #${order.orderNumber}:`, error)
                );

            this._emailService
                .sendAdminOrderCancelled({
                    orderNumber: order.orderNumber,
                    customerName: order.userSnapshot.name,
                    customerEmail: order.userSnapshot.email,
                    totalAmount: order.totalAmount,
                    reason,
                })
                .catch((error) =>
                    console.error(`Failed to send admin order-cancelled email for #${order.orderNumber}:`, error)
                );

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}