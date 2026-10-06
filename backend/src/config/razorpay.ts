import Razorpay from "razorpay";

// Mirrors VITE_PAYMENT_MODE in frontend/.env — flip both together
const isTestMode = process.env.PAYMENT_MODE === "test";

const keyId = isTestMode ? process.env.RAZORPAY_TEST_KEY_ID : process.env.RAZORPAY_KEY_ID;
const keySecret = isTestMode ? process.env.RAZORPAY_TEST_KEY_SECRET : process.env.RAZORPAY_KEY_SECRET;

// Constructing the Razorpay SDK with a missing/empty key throws synchronously
// at import time - the same class of crash this project already guards
// against for Twilio (see config/twilio.ts). Guard here instead of trusting
// env vars are always set, so a missing credential just disables checkout
// (RazorpayService throws a clear error only if something actually tries to
// use it) rather than taking the whole app down on startup.
export const razorpay = keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

if (!razorpay) {
    console.warn(
        `RAZORPAY_${isTestMode ? "TEST_" : ""}KEY_ID / KEY_SECRET not configured - payments are disabled.`
    );
}