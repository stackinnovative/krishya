import { CONTACT_EMAIL, CONTACT_PHONE, DEFAULT_STORE_NAME } from "@/lib/contact";
import { formatCurrency } from "@/lib/format";
import type { SettingsView, SocialLink } from "./types/settings.type";

/**
 * Everything the storefront shows about the store itself, resolved from
 * Business Settings. Both the server (`getStoreInfo` in ./server) and the
 * client (`useStoreContact`) go through this one mapping, so a value edited
 * in admin shows up the same way in the header, footer, checkout, policies
 * and copy. Env/default values are only a fallback for unset fields.
 */
export type StoreInfo = {
  storeName: string;
  email: string;
  phone: string;
  /** Uploaded admin logo; null means use the bundled brand mark. */
  logoUrl: string | null;
  deliveryCharge: number;
  freeAbove: number;
  /** Admin-managed social media links, in display order. */
  socialLinks: SocialLink[];
};

export const toStoreInfo = (settings: SettingsView | null | undefined): StoreInfo => ({
  storeName: settings?.storeName?.trim() || DEFAULT_STORE_NAME,
  email: settings?.email?.trim() || CONTACT_EMAIL,
  phone: settings?.phone?.trim() || CONTACT_PHONE,
  logoUrl: settings?.logo?.url || null,
  deliveryCharge: settings?.deliveryCharge ?? 0,
  freeAbove: settings?.freeAbove ?? 0,
  socialLinks: settings?.socialLinks ?? [],
});

/** The delivery-charge rule in words, from the admin's delivery charge and free-delivery threshold. */
export const describeDeliveryCharges = ({ deliveryCharge, freeAbove }: Pick<StoreInfo, "deliveryCharge" | "freeAbove">) => {
  if (deliveryCharge <= 0) return "Delivery is free on all orders.";
  if (freeAbove > 0) return `Delivery is free on orders above ${formatCurrency(freeAbove)}. A flat charge of ${formatCurrency(deliveryCharge)} applies to smaller orders.`;
  return `A flat delivery charge of ${formatCurrency(deliveryCharge)} applies to every order.`;
};

/** "Krishay Ayurveda" -> { lead: "Krishay", rest: "Ayurveda" } - the logo and hero set the first word apart. */
export const splitStoreName = (name: string) => {
  const [lead = name, ...rest] = name.trim().split(/\s+/);
  return { lead, rest: rest.join(" ") };
};
