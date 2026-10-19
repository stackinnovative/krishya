import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import type { ICartRepository } from "../../cart/repositories/cart.repository.interface.js";
import type { IPaymentRepository } from "../../payment/repositories/payment.repository.interface.js";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { ISyncPaymentUseCase } from "./interfaces/sync.payment.usecase.interface.js";
import { inject, injectable } from "tsyringe";
import type { IPaymentGateway } from "../../../core/ports/payment.service.interface.js";
import mongoose from "mongoose";
import { mapPaymentMode } from "../../../core/utils/get.payment.method.js";
import type { IWhatsAppService } from "../../../core/ports/whatsapp.service.interface.js";
import type { IEmailService } from "../../../core/ports/email.service.interface.js";
import { notifyOrderConfirmed } from "../utils/notify.order.confirmed.js";
import { confirmPaidOrder, notifyPaidOrderNeedsRefund } from "../utils/confirm.paid.order.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";

@injectable()
export class SyncPaymentUseCase implements ISyncPaymentUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository,
        @inject("IPaymentRepository")
        private readonly _paymentRepository: IPaymentRepository,
        @inject("ICartRepository")
        private readonly _cartRepository: ICartRepository,
        @inject("IPaymentGateway")
        private readonly _paymentGateway: IPaymentGateway,
        @inject("IWhatsAppService")
        private readonly _whatsAppService: IWhatsAppService,

        @inject("IEmailService")
        private readonly _emailService: IEmailService,

        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository,
    ) { }

    async execute(localOrderId: string): Promise<{ status: string }> {
        const order = await this._orderRepository.findById(localOrderId);
        if (!order) throw new Error("Order not found");

        if (order.orderStatus === "confirmed") {
            return { status: "confirmed" };
        }

        const payment = await this._paymentRepository.findByOrderId(localOrderId)
        if (!payment) {
            throw new CustomError(
                ResponseMessages.PAYMENT_NOT_FOUND,
                HttpStatusCode.NOT_FOUND,
            )
        }


        // Already handled: paid after cancellation and flagged for a refund.
        if (payment.status === "captured") {
            return { status: order.orderStatus ?? "cancelled" };
        }

        const razorpayOrderId = payment.providerOrderId;

        const razorpayPayment = await this._paymentGateway.fetchPaymentsByOrderId(
            razorpayOrderId
        );


        const capturedPayment = razorpayPayment.items.find(
            (payment: any) => payment.status === "captured"
        );

        if (capturedPayment) {

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                //confirm order (revives it if the auto-cancel job got there first)
                const outcome = await confirmPaidOrder(this._orderRepository, this._productRepository, order, session);

                //captured payment
                await this._paymentRepository.confirmPayment({
                    paymentId: payment.id!,
                    providerOrderId: razorpayOrderId,
                    providerPaymentId: capturedPayment.id,
                    currency: capturedPayment.currency,
                    amount: capturedPayment.amount,
                    paymentMode: mapPaymentMode(capturedPayment.method),
                    session,
                });

                // Clear Cart - only once the order really went through
                if (outcome === "confirmed" && order.guestId) {
                    await this._cartRepository.emptyCart(order.guestId, session);
                }

                await session.commitTransaction();

                if (outcome === "refund_needed") {
                    notifyPaidOrderNeedsRefund(this._emailService, order);
                    return { status: "cancelled" };
                }

                notifyOrderConfirmed(this._whatsAppService, this._emailService, order);

                return { status: "confirmed" };

            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        }

        return { status: "created" };
    }
}