import { Payment } from "../entities/payment.entity.js";
import type { ChangeStatusPayload, ConfirmPaymentPayload, FailPaymentPayload } from "../types/payment.type.js";
import type { ClientSession } from "mongoose";


export interface IPaymentRepository {
    create(paymentEntity: Payment): Promise<Payment>;
    save(paymentEntity: Payment, session?: ClientSession): Promise<Payment>;
    findById(id: string): Promise<Payment | null>;
    changeStatus(payload: ChangeStatusPayload): Promise<void>;
    findByProviderOrderId(providerOrderId: string, session?: ClientSession): Promise<Payment | null>;
    autoCancelPayment(orderIds: string[], session?: ClientSession): Promise<void>;
    failPayment(payload: FailPaymentPayload): Promise<void>;
    confirmPayment(payload: ConfirmPaymentPayload): Promise<void>;
    findByOrderId(orderId: string): Promise<Payment | null>;
}
