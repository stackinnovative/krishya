import { inject, injectable } from "tsyringe";
import mongoose from "mongoose";
import { mapRazorpayStatus } from "../../../core/utils/payment.status.helper.js";
import type { IHandleRazorpayWebhookUseCase } from "./interfaces/handle.webhook.use-case.interface.js";
import type { IPaymentRepository } from "../../payment/repositories/payment.repository.interface.js";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { ICartRepository } from "../../cart/repositories/cart.repository.interface.js";
import type { RazorpayWebhookEvent } from "../types/order.type.js";
import { Payment } from "../../payment/entities/payment.entity.js";
import { mapPaymentMode } from "../../../core/utils/get.payment.method.js";
import type { Order } from "../entities/order.entity.js";
import type { IWhatsAppService } from "../../../core/ports/whatsapp.service.interface.js";
import type { IEmailService } from "../../../core/ports/email.service.interface.js";
import { notifyOrderConfirmed } from "../utils/notify.order.confirmed.js";
import { confirmPaidOrder, notifyPaidOrderNeedsRefund, type PaidOrderOutcome } from "../utils/confirm.paid.order.js";

@injectable()
export class HandleRazorpayWebhookUseCase
    implements IHandleRazorpayWebhookUseCase {

    constructor(
        @inject("IPaymentRepository")
        private readonly _paymentRepository: IPaymentRepository,

        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository,

        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository,

        @inject("ICartRepository")
        private readonly _cartRepository: ICartRepository,

        @inject("IWhatsAppService")
        private readonly _whatsAppService: IWhatsAppService,

        @inject("IEmailService")
        private readonly _emailService: IEmailService,
    ) { }

    async execute(event: RazorpayWebhookEvent): Promise<void> {

        if (!event?.payload?.payment?.entity) {
            return; // ignore malformed webhook
        }

        const paymentEntity = event.payload.payment.entity;

        const session = await mongoose.startSession();
        let captured: { order: Order; outcome: PaidOrderOutcome } | null = null;
        try {
            const payment = await this._paymentRepository
                .findByProviderOrderId(paymentEntity.order_id, session);

            // Not one of ours - nothing to do (no transaction has been started yet, so nothing to abort).
            if (!payment) return;

            // STRONG IDEMPOTENCY
            const mappedStatus = mapRazorpayStatus(paymentEntity.status);

            if (payment.status === mappedStatus) return;

            session.startTransaction();

            switch (event.event) {

                case "payment.captured":
                    captured = await this.handleCaptured(
                        payment,
                        paymentEntity,
                        session
                    );
                    break;
                default:
                    break;
            }
            await session.commitTransaction();

            if (captured?.outcome === "confirmed") {
                notifyOrderConfirmed(this._whatsAppService, this._emailService, captured.order);
            } else if (captured?.outcome === "refund_needed") {
                notifyPaidOrderNeedsRefund(this._emailService, captured.order);
            }

        } catch (error) {
            if (session.inTransaction()) await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    private async handleCaptured(
        payment: Payment,
        entity: RazorpayWebhookEvent["payload"]["payment"]["entity"],
        session: mongoose.ClientSession
    ): Promise<{ order: Order; outcome: PaidOrderOutcome } | null> {

        const order = await this._orderRepository
            .findById(payment.orderId, session);

        if (!order) return null;

        // Only an unpaid ("created") or auto-cancelled order can be confirmed by a payment - never move an
        // order the admin already accepted/dispatched back to "confirmed".
        if (order.orderStatus !== "created" && order.orderStatus !== "cancelled") return null;

        const expectedAmount = order.totalAmount * 100;

        if (entity.amount !== expectedAmount) {
            return null;
        }

        const newPayment = new Payment({
            id: payment.id,
            orderId: payment.orderId,
            userId: payment.userId,
            guestId: payment.guestId,
            provider: "razorpay",
            providerOrderId: entity.order_id,
            providerPaymentId: entity.id,
            amount: entity.amount,
            currency: entity.currency,
            status: mapRazorpayStatus(entity.status),
            paymentMode: mapPaymentMode(entity.method!),
        })

        await this._paymentRepository.save(newPayment, session);

        // Revives the order if the auto-cancel job got there first.
        const outcome = await confirmPaidOrder(this._orderRepository, this._productRepository, order, session);

        if (outcome === "confirmed" && payment.guestId) {
            await this._cartRepository.emptyCart(
                payment.guestId,
                session
            );
        }

        return { order, outcome };
    }
}