import crypto from "crypto";
import { inject, injectable } from "tsyringe";
import type { IPaymentRepository } from "../../payment/repositories/payment.repository.interface.js";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { IPaymentGateway } from "../../../core/ports/payment.service.interface.js";
import type { ICartRepository } from "../../cart/repositories/cart.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { mapPaymentMode } from "../../../core/utils/get.payment.method.js";
import mongoose from "mongoose";
import type { VerifyPaymentRequestDto } from "../dtos/verify.payment.dto.js";
import type { IVerifyPaymentUseCase } from "./interfaces/verify.payment.use-case.interface.js";
import type { IWhatsAppService } from "../../../core/ports/whatsapp.service.interface.js";
import type { IEmailService } from "../../../core/ports/email.service.interface.js";
import { notifyOrderConfirmed } from "../utils/notify.order.confirmed.js";
import { confirmPaidOrder, notifyPaidOrderNeedsRefund } from "../utils/confirm.paid.order.js";

@injectable()
export class VerifyPaymentUseCase implements IVerifyPaymentUseCase {
    constructor(
        @inject("IPaymentRepository")
        private readonly _paymentRepository: IPaymentRepository,

        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository,

        @inject("IPaymentGateway")
        private readonly _paymentGateway: IPaymentGateway,

        @inject("ICartRepository")
        private readonly _cartRepository: ICartRepository,

        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository,

        @inject("IWhatsAppService")
        private readonly _whatsAppService: IWhatsAppService,

        @inject("IEmailService")
        private readonly _emailService: IEmailService,

    ) { }

    async execute(dto: VerifyPaymentRequestDto): Promise<void> {

        //  LOAD PAYMENT RECORD

        const payment = await this._paymentRepository.findByProviderOrderId(
            dto.razorpay_order_id
        );

        if (!payment) {
            throw new CustomError(
                ResponseMessages.PAYMENT_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }

        if (payment.status === "captured") {
            return;
        }

        // VERIFY SIGNATURE (CRITICAL SECURITY)

        const body = `${dto.razorpay_order_id}|${dto.razorpay_payment_id}`;

        // Mirrors backend/src/config/razorpay.ts — must use the same key pair
        // (test vs live) that created the order, or the signature never matches.
        const isTestMode = process.env.PAYMENT_MODE === "test";
        const signingSecret = isTestMode
            ? process.env.RAZORPAY_TEST_KEY_SECRET!
            : process.env.RAZORPAY_KEY_SECRET!;

        const expectedSignature = crypto
            .createHmac("sha256", signingSecret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== dto.razorpay_signature) {
            throw new CustomError(
                ResponseMessages.INVALID_PAYMENT_SIGNATURE,
                HttpStatusCode.BAD_REQUEST
            );
        }


        // FETCH PAYMENT FROM RAZORPAY (SERVER TRUST)
        const razorpayPayment = await this._paymentGateway.fetchPayment(
            dto.razorpay_payment_id
        );

        if (razorpayPayment.order_id !== dto.razorpay_order_id) {
            throw new CustomError(
                ResponseMessages.INVALID_PAYMENT_ORDER_ID,
                HttpStatusCode.BAD_REQUEST
            );
        }

        if (!razorpayPayment || razorpayPayment.status !== "captured") {
            throw new CustomError(
                ResponseMessages.PAYMENT_NOT_CAPTURED,
                HttpStatusCode.BAD_REQUEST
            );
        }

        // LOAD ORDER
        const order = await this._orderRepository.findById(payment.orderId);

        if (!order) {
            throw new CustomError(
                ResponseMessages.ORDER_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }


        // AMOUNT VALIDATION
        // (Razorpay returns amount in paise)


        const expectedAmount = order.totalAmount * 100;

        if (razorpayPayment.amount !== expectedAmount) {
            throw new CustomError(
                ResponseMessages.INVALID_PAYMENT_AMOUNT,
                HttpStatusCode.BAD_REQUEST
            );
        }

        if (order.orderStatus === "confirmed") {
            throw new CustomError(
                ResponseMessages.ORDER_ALREADY_CONFIRMED,
                HttpStatusCode.BAD_REQUEST
            );
        }



        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            await this._paymentRepository.confirmPayment({
                paymentId: payment.id!,
                providerOrderId: razorpayPayment.order_id,
                providerPaymentId: razorpayPayment.id,
                currency: razorpayPayment.currency,
                amount: razorpayPayment.amount,
                paymentMode: mapPaymentMode(razorpayPayment.method),
                session,
            });

            //  UPDATE ORDER STATUS (revives it if the auto-cancel job got there first)
            const outcome = await confirmPaidOrder(this._orderRepository, this._productRepository, order, session);

            //empty cart - only once the order really went through
            if (outcome === "confirmed") {
                await this._cartRepository.emptyCart(payment.guestId!, session)
            }

            await session.commitTransaction();

            if (outcome === "confirmed") {
                notifyOrderConfirmed(this._whatsAppService, this._emailService, order);
            } else {
                notifyPaidOrderNeedsRefund(this._emailService, order);
            }

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    }
}
