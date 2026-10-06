import { Payment } from "../entities/payment.entity.js";

export class PaymentMapper {
    static toDomain(paymentModelData: any): Payment | null {
        if (!paymentModelData) {
            return null;
        }

        const idString =
            paymentModelData._id?.toString() ||
            paymentModelData.id?.toString();

        if (!idString) {
            console.error("Payment data from DB is missing an ID:", paymentModelData);
            return null;
        }

        return new Payment({
            id: idString,

            orderId: paymentModelData.orderId?.toString(),
            userId: paymentModelData.userId?.toString(),
            guestId: paymentModelData.guestId?.toString(),

            provider: paymentModelData.provider,

            providerOrderId: paymentModelData.providerOrderId,
            providerPaymentId: paymentModelData.providerPaymentId,

            amount: paymentModelData.amount,
            currency: paymentModelData.currency,

            status: paymentModelData.status,
            paymentMode: paymentModelData.paymentMode,

            failureReason: paymentModelData.failureReason,
        });
    }

    static toPersistence(paymentEntity: Payment): any {
        return {
            orderId: paymentEntity.orderId,
            userId: paymentEntity.userId,
            guestId: paymentEntity.guestId,

            provider: paymentEntity.provider,

            providerOrderId: paymentEntity.providerOrderId,
            providerPaymentId: paymentEntity.providerPaymentId,

            amount: paymentEntity.amount,
            currency: paymentEntity.currency,

            status: paymentEntity.status,
            paymentMode: paymentEntity.paymentMode,

            failureReason: paymentEntity.failureReason,
        };
    }
}
