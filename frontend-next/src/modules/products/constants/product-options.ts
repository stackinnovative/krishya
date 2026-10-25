/** Mirrors backend/src/modules/product/types/product.type.ts PRODUCT_TYPES, VARIANT_UNITS and PRODUCT_LIMITS exactly. */
export const PRODUCT_TYPES = ["thailam", "keram", "face-pack"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

const PRODUCT_TYPE_VALUES: readonly string[] = PRODUCT_TYPES;
/** Narrows an untrusted value (e.g. a ?type= query param) to a known product type. */
export const isProductType = (v: string | null | undefined): v is ProductType => !!v && PRODUCT_TYPE_VALUES.includes(v);

/** How each form reads on cards, filters and the product page (as in the design: "Thailam · Oil"). */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  thailam: "Thailam · Oil",
  keram: "Keram · Hair Oil",
  "face-pack": "Herbal Face Pack",
};

export const PRODUCT_TYPE_OPTIONS = PRODUCT_TYPES.map((value) => ({ value, label: PRODUCT_TYPE_LABELS[value] }));

export const VARIANT_UNITS = ["ml", "g", "tablets", "capsules"] as const;
export type VariantUnit = (typeof VARIANT_UNITS)[number];

export const PRODUCT_LIMITS = {
  nameMin: 2,
  name: 150,
  shortDescription: 160,
  descriptionMin: 10,
  description: 1000,
  howToUse: 1000,
  storage: 500,
  badge: 20,
  ingredients: 20,
  ingredientName: 60,
  botanicalName: 80,
  imagesMax: 5,
  variantsMax: 10,
} as const;

/** "200 ml", "60 tablets" - same format the backend snapshots on carts and orders. */
export const formatVariantLabel = ({ quantity, unit }: { quantity: number; unit: string }): string => `${quantity} ${unit}`;
