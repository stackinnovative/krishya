import { env } from "./env";

/** Shown wherever Business Settings has no store name yet. */
export const DEFAULT_STORE_NAME = "Krishay Ayurveda";

export const STORE_TAGLINE = "Rooted in Ayurveda, crafted for today";

/** Public contact info. Business Settings (admin) is the source of truth;
 * these env-driven values are only the fallback until it's filled in. */
export const CONTACT_EMAIL = env.contactEmail || "hello@krishayayurveda.in";
export const CONTACT_PHONE = env.contactPhone;

/** Optional - rendered only when configured (never a placeholder number on a live store). */
export const AYUSH_LICENSE_NO = env.ayushLicenseNo;
export const STORE_ADDRESS = env.storeAddress || "Kochi, Kerala";

export const AYUSH_DISCLAIMER =
  "Use as directed by a qualified Ayurvedic physician. This product is not intended to diagnose, treat, cure or prevent any disease.";

export const INSTAGRAM_HANDLE = "krishayayurveda";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
export const FACEBOOK_URL = env.facebookUrl || "https://facebook.com";

/** wa.me needs the full international number with digits only; a bare
 * 10-digit Indian mobile number gets the 91 country code prefixed. */
const toWhatsAppNumber = (phone: string) => {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
};

/** A WhatsApp chat link to `phone`, optionally pre-filled with `text`. With no number configured it opens WhatsApp's own share sheet with the text. */
export const getWhatsAppLink = (phone: string | undefined, text?: string): string => {
  const number = phone ? toWhatsAppNumber(phone) : "";
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${number}${query}`;
};

export const WHATSAPP_LINK = getWhatsAppLink(CONTACT_PHONE);
