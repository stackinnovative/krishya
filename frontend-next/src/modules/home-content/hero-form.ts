import type { FormFieldDef } from "@/modules/admin-shell/components/FormModal";
import { HERO_ASPECT_RATIO, HERO_LIMITS } from "./constants";
import type { CreateHeroPayload, HeroView } from "./types/home-content.type";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Same rule as the backend DTO: a page on this site ("/products") or a full https:// address. */
export const validateHeroLink = (value: unknown): string | null => {
  const v = str(value);
  if (!v) return null;
  if (v.startsWith("/") && !v.startsWith("//")) return null;
  if (/^https?:\/\/\S+$/.test(v)) return null;
  return "Use a page on this site (e.g. /products) or a full address starting with https://";
};

type ProductOption = { label: string; value: string };

/**
 * Hero slide form. `otherPositions` are the positions already taken by the
 * other slides, so a clash is caught here instead of round-tripping as a 400.
 */
export const buildHeroFields = (productOptions: ProductOption[], otherPositions: number[], productsLoading: boolean): FormFieldDef[] => [
  {
    key: "image",
    label: "Photo",
    type: "image",
    required: true,
    imageAspectRatio: HERO_ASPECT_RATIO,
    hint: "Portrait (4:5) - the preview shows exactly what customers see inside the arch. Use the pencil to adjust the crop.",
  },
  {
    key: "label",
    label: "Eyebrow text",
    type: "text",
    placeholder: "e.g. Authentic Kerala Ayurveda",
    maxLength: HERO_LIMITS.label,
    allowSpecialChars: true,
    hint: "Optional. Small capitals above the headline.",
  },
  {
    key: "title",
    label: "Headline",
    type: "text",
    required: true,
    placeholder: "e.g. Krishay Ayurveda",
    minLength: HERO_LIMITS.titleMin,
    maxLength: HERO_LIMITS.title,
    hint: "The first word shows in gold. 2-4 words reads best.",
  },
  {
    key: "subtitle",
    label: "Supporting text",
    type: "area",
    rows: 2,
    required: true,
    placeholder: "e.g. Pure Kerala remedies, made by hand in small batches.",
    minLength: HERO_LIMITS.subtitleMin,
    maxLength: HERO_LIMITS.subtitle,
    hint: "One or two short sentences under the headline.",
  },
  {
    key: "buttonLabel",
    label: "Main button text",
    type: "text",
    placeholder: "Shop Now",
    maxLength: HERO_LIMITS.buttonLabel,
    allowSpecialChars: true,
    hint: "Leave the text and link empty to show “Shop Now” linking to the shop.",
  },
  {
    key: "buttonUrl",
    label: "Main button link",
    type: "url",
    placeholder: "/products",
    maxLength: HERO_LIMITS.url,
    hint: "A page on this site (/products, /about) or a full address (https://…). Required when the button has text.",
    validate: (v, all) => validateHeroLink(v) ?? (str(v) || !str(all.buttonLabel) ? null : "Add a link for the button, or clear its text."),
  },
  {
    key: "secondaryLabel",
    label: "Second link text",
    type: "text",
    placeholder: "e.g. Our Story",
    maxLength: HERO_LIMITS.buttonLabel,
    allowSpecialChars: true,
    hint: "Optional underlined link next to the button.",
    validate: (v, all) => (str(v) || !str(all.secondaryUrl) ? null : "Add text for the second link, or clear its link."),
  },
  {
    key: "secondaryUrl",
    label: "Second link",
    type: "url",
    placeholder: "e.g. /about",
    maxLength: HERO_LIMITS.url,
    validate: (v, all) => validateHeroLink(v) ?? (str(v) || !str(all.secondaryLabel) ? null : "Add a link for the second link, or clear its text."),
  },
  {
    key: "badgeText",
    label: "Badge",
    type: "text",
    placeholder: "e.g. AYUSH Certified",
    maxLength: HERO_LIMITS.badgeText,
    allowSpecialChars: true,
    hint: "Optional gold pill on the photo. Leave empty to hide it.",
  },
  {
    key: "spotlightProductId",
    label: "Spotlight product",
    type: "searchable-select",
    placeholder: productsLoading ? "Loading products…" : "Search a product…",
    options: [{ label: "No spotlight", value: "" }, ...productOptions],
    hint: "Optional. A small product card floats on the photo and opens the product. Only live products are listed.",
  },
  {
    key: "spotlightLabel",
    label: "Spotlight tag",
    type: "text",
    placeholder: "e.g. Bestseller",
    maxLength: HERO_LIMITS.spotlightLabel,
    allowSpecialChars: true,
    hint: "Shown before the price - e.g. “Bestseller · from ₹240”.",
    validate: (v, all) => (str(v) && !str(all.spotlightProductId) ? "Pick a spotlight product first, or clear the tag." : null),
  },
  {
    key: "priority",
    label: "Slide position",
    type: "number",
    required: true,
    hint: "Lower numbers show first. Each slide needs its own number.",
    validate: (v) => {
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isInteger(n) || n < 0 || n > 1000) return "Use a whole number from 0 to 1000.";
      if (otherPositions.includes(n)) return `Position ${n} is already used by another slide.`;
      return null;
    },
  },
];

/** Form values for a new slide (placed after the last one) or an existing slide. */
export const heroInitialValues = (hero: HeroView | "new", nextPosition: number): Record<string, unknown> =>
  hero === "new"
    ? {
        image: null,
        label: "",
        title: "",
        subtitle: "",
        buttonLabel: "",
        buttonUrl: "",
        secondaryLabel: "",
        secondaryUrl: "",
        badgeText: "",
        spotlightProductId: "",
        spotlightLabel: "",
        priority: nextPosition,
      }
    : {
        image: hero.image,
        label: hero.label ?? "",
        title: hero.title,
        subtitle: hero.subtitle,
        buttonLabel: hero.buttonLabel ?? "",
        buttonUrl: hero.buttonUrl ?? "",
        secondaryLabel: hero.secondaryLabel ?? "",
        secondaryUrl: hero.secondaryUrl ?? "",
        badgeText: hero.badgeText ?? "",
        spotlightProductId: hero.spotlightProductId ?? "",
        spotlightLabel: hero.spotlightLabel ?? "",
        priority: hero.priority ?? nextPosition,
      };

/** Trimmed API payload from the form values. */
export const toHeroPayload = (v: Record<string, unknown>, image: CreateHeroPayload["image"]): CreateHeroPayload => ({
  image,
  label: str(v.label),
  title: str(v.title),
  subtitle: str(v.subtitle),
  buttonLabel: str(v.buttonLabel),
  buttonUrl: str(v.buttonUrl),
  secondaryLabel: str(v.secondaryLabel),
  secondaryUrl: str(v.secondaryUrl),
  badgeText: str(v.badgeText),
  spotlightProductId: str(v.spotlightProductId),
  spotlightLabel: str(v.spotlightProductId) ? str(v.spotlightLabel) : "",
  priority: typeof v.priority === "number" ? v.priority : Number(v.priority),
});
