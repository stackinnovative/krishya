import type { VariantUnit } from "../types/product.type.js";

type VariantSize = { quantity: number; unit: VariantUnit };

/**
 * Whole-number "% off" shown next to the struck-through MRP. Rounded down so
 * the storefront never claims a bigger discount than the real one; the
 * 1e-9 nudge stops float noise (e.g. 29.999999) from losing a whole percent.
 */
export const calcDiscountPercent = (mrp: number, price: number): number => {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.min(100, Math.max(0, Math.floor(((mrp - price) / mrp) * 100 + 1e-9)));
};

/** "200 ml", "60 tablets" - what carts, orders and invoices show for a variant. */
export const formatVariantLabel = ({ quantity, unit }: VariantSize): string => `${quantity} ${unit}`;

/** Two variants clash when they're the same amount of the same unit. */
export const variantSizeKey = ({ quantity, unit }: VariantSize): string => `${quantity}|${unit}`;

export const hasDuplicateVariantSizes = (variants: VariantSize[]): boolean => {
  const keys = variants.map(variantSizeKey);
  return new Set(keys).size !== keys.length;
};
