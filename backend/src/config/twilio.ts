import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Constructing the Twilio SDK client with a missing/malformed SID throws
// synchronously at import time - the same class of crash this project hit
// with Resend early on. Guard here instead of trusting env vars are always
// set, so a missing credential just disables WhatsApp sends (each call site
// already checks for a null client) rather than taking the whole app down.
export const twilioClient =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

if (!twilioClient) {
  console.warn(
    "TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN not configured - WhatsApp sends are disabled."
  );
}
