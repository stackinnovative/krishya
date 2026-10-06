const ALLOWED_PAYMENT_MODES = [
    "upi",
    "card",
    "netbanking",
    "wallet",
    "emi",
] as const;

type PaymentMode = typeof ALLOWED_PAYMENT_MODES[number];

export const mapPaymentMode = (method: string): PaymentMode => {
    if (ALLOWED_PAYMENT_MODES.includes(method as PaymentMode)) {
        return method as PaymentMode;
    }

    throw new Error(`Unsupported payment method: ${method}`);
};