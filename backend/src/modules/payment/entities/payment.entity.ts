import {
    PAYMENT_MODE,
    PAYMENT_STATUS,
    type PaymentMode,
    type PaymentStatus,
} from "../types/payment.type.js";

/* ---------- TYPES ---------- */

export type PaymentProps = {
    id?: string | null;
    orderId: string;
    userId: string | null;
    guestId: string | null;
    provider: string | undefined;
    providerOrderId: string;
    providerPaymentId?: string | undefined;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMode: PaymentMode;
    failureReason?: string | undefined
};

/* ---------- ENTITY ---------- */

export class Payment {
    public readonly id: string | null;
    public readonly orderId: string;
    public readonly userId: string | null;
    public readonly guestId: string | null;
    public readonly provider: string | undefined;
    public readonly providerOrderId: string;
    public readonly providerPaymentId?: string | undefined;
    public readonly amount: number;
    public readonly currency: string;
    public readonly status: PaymentStatus;
    public readonly paymentMode: PaymentMode;
    public readonly failureReason?: string | undefined;


    constructor(props: PaymentProps) {
        /* ---------- VALIDATIONS ---------- */

        if (!props.orderId) {
            throw new Error("Order ID is required in payment");
        }

        if (!props.userId && !props.guestId) {
            throw new Error("User ID or Guest ID is required in payment");
        }

        if (!props.providerOrderId?.trim()) {
            throw new Error("Provider order ID is required in payment");
        }

        if (props.amount < 0) {
            throw new Error("Payment amount cannot be negative");
        }

        const status = props.status ?? "created";

        if (!PAYMENT_STATUS.includes(status)) {
            throw new Error("Invalid payment status");
        }

        if (props.paymentMode && !PAYMENT_MODE.includes(props.paymentMode)) {
            throw new Error("Invalid payment mode");
        }

        /* ---------- ASSIGN ---------- */

        this.id = props.id ?? null;
        this.orderId = props.orderId;
        this.userId = props.userId;
        this.guestId = props.guestId;
        this.provider = props.provider?.trim() || "razorpay";
        this.providerOrderId = props.providerOrderId.trim();
        this.providerPaymentId = props.providerPaymentId?.trim();
        this.amount = props.amount;
        this.currency = (props.currency ?? "INR").toUpperCase();
        this.status = status;
        this.paymentMode = props.paymentMode;
        this.failureReason = props?.failureReason?.trim()
    }

    /* ---------- STATE TRANSITIONS ---------- */

    authorize(params: {
        providerPaymentId: string;
        providerSignature: string;
        paymentMode?: PaymentMode;
    }): Payment {
        if (this.status !== "created") {
            throw new Error("Only created payments can be authorized");
        }

        return new Payment({
            ...this,
            status: "authorized",
            providerPaymentId: params.providerPaymentId,
            providerSignature: params.providerSignature,
            paymentMode: params.paymentMode,
        });
    }

    capture(): Payment {
        if (this.status !== "authorized") {
            throw new Error("Only authorized payments can be captured");
        }

        return new Payment({
            ...this,
            status: "captured",
        });
    }

    fail(reason: string, paymentId: string): Payment {
        if (!reason.trim()) {
            throw new Error("Failure reason is required");
        }

        if (this.status === "captured") {
            throw new Error("Captured payments cannot be marked as failed");
        }

        return new Payment({
            ...this,
            status: "failed",
            providerPaymentId: paymentId,
            failureReason: reason.trim(),
        });
    }

    refund(): Payment {
        if (this.status !== "captured") {
            throw new Error("Only captured payments can be refunded");
        }

        return new Payment({
            ...this,
            status: "refunded",
        });
    }
}
