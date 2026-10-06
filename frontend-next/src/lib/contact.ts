import { env } from "./env";

/** Public contact/social info shown in the footer and legal pages. Sourced
 * from env vars so it can be updated without a code change. */
export const CONTACT_EMAIL = env.contactEmail || "artspace.hello@gmail.com";
export const CONTACT_PHONE = env.contactPhone || "+91 87147 32282";

const WHATSAPP_NUMBER = CONTACT_PHONE.replace(/[^\d]/g, "");

export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const FACEBOOK_URL = env.facebookUrl || "https://facebook.com/artspace";
