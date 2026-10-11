import { describeDeliveryCharges, type StoreInfo } from "@/modules/settings/store-info";
import { formatCurrency } from "@/lib/format";

/** Mirrors FAQ_LIMITS in backend/src/modules/faq/types/faq.type.ts. */
export const FAQ_LIMITS = {
  groupName: 60,
  question: 200,
  answer: 1000,
  homeMax: 6,
} as const;

type DeliveryRules = Pick<StoreInfo, "deliveryCharge" | "freeAbove">;

/** Words an answer can include that are filled from Business Settings, so they never go out of date. */
export const FAQ_PLACEHOLDERS: { token: string; meaning: string; fill: (store: DeliveryRules) => string }[] = [
  { token: "{delivery}", meaning: "the full delivery rule in a sentence", fill: describeDeliveryCharges },
  { token: "{deliveryCharge}", meaning: "the delivery charge, e.g. ₹60", fill: (s) => formatCurrency(s.deliveryCharge) },
  { token: "{freeAbove}", meaning: "the free-delivery amount, e.g. ₹999", fill: (s) => formatCurrency(s.freeAbove) },
];

/** Answer text as customers see it - placeholders replaced with today's Business Settings. */
export const fillFaqAnswer = (answer: string, store: DeliveryRules): string =>
  FAQ_PLACEHOLDERS.reduce((text, p) => text.split(p.token).join(p.fill(store)), answer);
