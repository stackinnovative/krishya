import { z } from "zod";

/* ---------- Razorpay Patterns ---------- */

const razorpayOrderIdRegex = /^order_[a-zA-Z0-9]+$/;
const razorpayPaymentIdRegex = /^pay_[a-zA-Z0-9]+$/;
const razorpaySignatureRegex = /^[a-f0-9]{64}$/;

/* ---------- Verify Payment Schema ---------- */

export const VerifyPaymentSchema = z
    .object({
        razorpay_order_id: z
            .string()
            .trim()
            .regex(razorpayOrderIdRegex, "Invalid Razorpay order ID"),

        razorpay_payment_id: z
            .string()
            .trim()
            .regex(razorpayPaymentIdRegex, "Invalid Razorpay payment ID"),

        razorpay_signature: z
            .string()
            .trim()
            .regex(razorpaySignatureRegex, "Invalid Razorpay signature"),
    })
    .strict();

/* ---------- DTO Type ---------- */

export type VerifyPaymentRequestDto = z.infer<
    typeof VerifyPaymentSchema
>;