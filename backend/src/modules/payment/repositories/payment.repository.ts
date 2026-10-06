import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { CustomError } from "../../../core/errors/custom.error.js";

import { Payment } from "../entities/payment.entity.js";
import { PaymentModel } from "../infrastructure/payment.schema.js";
import { PaymentMapper } from "../mappers/payment.mapper.js";

import type { IPaymentRepository } from "./payment.repository.interface.js";
import type { ChangeStatusPayload, ConfirmPaymentPayload, FailPaymentPayload } from "../types/payment.type.js";
import type { ClientSession } from "mongoose";

export class PaymentRepository implements IPaymentRepository {

    /* ---------- CREATE ---------- */
    async create(paymentEntity: Payment): Promise<Payment> {
        const persistenceData = PaymentMapper.toPersistence(paymentEntity);

        const created = await PaymentModel.create(persistenceData);

        const domainPayment = PaymentMapper.toDomain(created);

        if (!domainPayment) {
            throw new CustomError(
                ResponseMessages.FAILED_TO_MAP,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
            );
        }

        return domainPayment;
    }

    /* ---------- FIND BY ID ---------- */
    async findById(id: string): Promise<Payment | null> {
        const foundDocument = await PaymentModel.findOne({ _id: id }).lean();

        return PaymentMapper.toDomain(foundDocument);
    }

    /* ---------- SAVE FULL ENTITY ---------- */
    async save(paymentEntity: Payment, session?: ClientSession): Promise<Payment> {
        if (!paymentEntity.id) {
            throw new CustomError(
                ResponseMessages.ID_MISSING,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
            );
        }

        const persistenceData = PaymentMapper.toPersistence(paymentEntity);

        const updatedDocument = await PaymentModel.findByIdAndUpdate(
            paymentEntity.id,
            { $set: persistenceData },
            { new: true, session: session ?? null },
        ).lean();

        if (!updatedDocument) {
            throw new CustomError(
                ResponseMessages.PAYMENT_NOT_FOUND,
                HttpStatusCode.NOT_FOUND,
            );
        }

        const domainPayment = PaymentMapper.toDomain(updatedDocument);

        if (!domainPayment) {
            throw new CustomError(
                ResponseMessages.FAILED_TO_MAP,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
            );
        }

        return domainPayment;
    }

    /* ---------- CHANGE STATUS ONLY ---------- */
    async changeStatus(
        payload: ChangeStatusPayload
    ): Promise<void> {
        const { orderId, status, session, reason } = payload;

        const result = await PaymentModel.updateOne(
            { orderId: orderId },
            { $set: { status, failureReason: reason } },
            session ? { session } : {}
        );

        if (result.matchedCount === 0) {
            throw new Error("Payment not found");
        }
    }

    async findByProviderOrderId(providerOrderId: string, session?: ClientSession): Promise<Payment | null> {
        const query = PaymentModel.findOne({ providerOrderId });
        if (session) {
            query.session(session);
        }
        const foundDocument = await query.lean();

        return PaymentMapper.toDomain(foundDocument);
    }

    async autoCancelPayment(orderIds: string[], session?: ClientSession): Promise<void> {
        const result = await PaymentModel.updateMany(
            { orderId: { $in: orderIds }, status: "created" },
            {
                $set: {
                    status: "failed",
                    failureReason: "Auto cancelled due to payment timeout",
                }
            },
            session ? { session } : {}
        );

        if (result.matchedCount === 0) {
            throw new Error("Payment not found");
        }
    }

    //fail payment
    async failPayment(payload: FailPaymentPayload): Promise<void> {
        const { paymentId, reason, providerPaymentId, session } = payload;

        const result = await PaymentModel.updateOne(
            { _id: paymentId, status: "created" },
            { $set: { status: "failed", failureReason: reason, providerPaymentId } },
            session ? { session } : {}
        );

        if (result.matchedCount === 0) {
            throw new Error("Payment not found");
        }
    }

    //confirm payment
    async confirmPayment(payload: ConfirmPaymentPayload): Promise<void> {
        const { paymentId, providerPaymentId, currency, amount, session, paymentMode } = payload;

        const result = await PaymentModel.updateOne(
            { _id: paymentId, status: { $in: ["created", "authorized"] } },
            { $set: { status: "captured", providerPaymentId, currency, amount, paymentMode } },
            session ? { session } : {}
        );

        if (result.matchedCount === 0) {
            throw new Error("Payment not found");
        }
    }

    async findByOrderId(orderId: string): Promise<Payment | null> {
        const foundDocument = await PaymentModel.findOne({ orderId }).lean();
        return PaymentMapper.toDomain(foundDocument);
    }
}
