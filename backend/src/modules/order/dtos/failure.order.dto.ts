import { z } from "zod";

/* ---------- Razorpay Patterns ---------- */

const razorpayOrderIdRegex = /^order_[a-zA-Z0-9]+$/;
const razorpayPaymentIdRegex = /^pay_[a-zA-Z0-9]+$/;

/* ---------- Verify Payment Schema ---------- */

export const HandlePaymentFailureSchema = z
    .object({
        razorpay_order_id: z
            .string()
            .trim()
            .regex(razorpayOrderIdRegex, "Invalid Razorpay order ID"),

        razorpay_payment_id: z
            .string()
            .trim()
            .regex(razorpayPaymentIdRegex, "Invalid Razorpay payment ID"),

        failure_reason: z
            .string()
            .trim()
            .optional(),
    })
    .strict();

/* ---------- DTO Type ---------- */

export type HandlePaymentFailureRequestDto = z.infer<
    typeof HandlePaymentFailureSchema
>;





