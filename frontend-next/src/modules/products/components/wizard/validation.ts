import type { WizardColor, WizardDetails, WizardSize } from "./wizard.types";

/** Mirrors backend/src/modules/product/entities/product.entity.ts and dtos/*.dto.ts 1:1, so the wizard never round-trips to the server just to learn a value is invalid. */
export const DETAILS_LIMITS = {
  nameMin: 2,
  nameMax: 150,
  descriptionMin: 10,
  descriptionMax: 1000,
};

export const MAX_IMAGES_PER_COLOR = 3;

export function validateDetails(details: WizardDetails): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = details.name.trim();
  if (!name) {
    errors.name = "Product name is required.";
  } else if (name.length < DETAILS_LIMITS.nameMin || name.length > DETAILS_LIMITS.nameMax) {
    errors.name = `Product name must be between ${DETAILS_LIMITS.nameMin} and ${DETAILS_LIMITS.nameMax} characters.`;
  }

  const description = details.description.trim();
  if (!description) {
    errors.description = "Description is required.";
  } else if (description.length < DETAILS_LIMITS.descriptionMin || description.length > DETAILS_LIMITS.descriptionMax) {
    errors.description = `Description must be between ${DETAILS_LIMITS.descriptionMin} and ${DETAILS_LIMITS.descriptionMax} characters.`;
  }

  if (!details.categoryId) {
    errors.categoryId = "Choose a category.";
  }

  return errors;
}

const isBlank = (v: string) => !v.trim();

/** Per-field messages for one size row, for inline display under each input - undefined means that field is valid. */
export function sizeFieldErrors(color: WizardColor, index: number): { size?: string; price?: string; stock?: string } {
  const row = color.sizes[index]!;
  const sizeKey = row.size.trim().toLowerCase();
  const duplicateSize = !!sizeKey && color.sizes.some((s, i) => i !== index && s.size.trim().toLowerCase() === sizeKey);
  const price = Number(row.price);
  const stock = Number(row.stock);

  return {
    size: isBlank(row.size) ? "Size is required." : duplicateSize ? "Duplicate size." : undefined,
    price: row.price.trim() === "" || Number.isNaN(price) || price < 0 ? "Price must be 0 or more." : undefined,
    stock: row.stock.trim() === "" || Number.isNaN(stock) || stock < 0 ? "Stock must be 0 or more." : undefined,
  };
}

export function sizeRowIssues(color: WizardColor, index: number) {
  const errors = sizeFieldErrors(color, index);
  return {
    sizeInvalid: !!errors.size,
    priceInvalid: !!errors.price,
    stockInvalid: !!errors.stock,
  };
}

/** First blocking issue for a single colour, or null if it's valid. */
export function colorIssue(color: WizardColor): string | null {
  const label = color.name.trim() || "This colour";
  if (!color.name.trim()) return "Every colour needs a name.";
  if (color.images.length === 0) return `Add at least one photo for "${label}".`;
  if (color.images.length > MAX_IMAGES_PER_COLOR) return `"${label}" can have at most ${MAX_IMAGES_PER_COLOR} photos.`;
  if (color.sizes.length === 0) return `Add at least one size for "${label}".`;

  for (let i = 0; i < color.sizes.length; i++) {
    const { sizeInvalid, priceInvalid, stockInvalid } = sizeRowIssues(color, i);
    if (sizeInvalid) return `"${label}": every size needs a value, and sizes can't repeat.`;
    if (priceInvalid) return `"${label}": price must be 0 or more.`;
    if (stockInvalid) return `"${label}": stock must be 0 or more.`;
  }

  return null;
}

export function duplicateColorNameIssue(colors: WizardColor[]): string | null {
  const seen = new Set<string>();
  for (const c of colors) {
    const key = c.name.trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) return `Duplicate colour name: ${c.name.trim()}`;
    seen.add(key);
  }
  return null;
}

export const totalVariantCount = (colors: { sizes: WizardSize[] }[]): number =>
  colors.reduce((n, c) => n + c.sizes.length, 0);

/** The size row that should drive the product's displayed price: the sole
 * variant when there's only one across the whole product (auto-default,
 * regardless of any stored flag), otherwise whichever row is explicitly
 * flagged - or null if none/more than one is (validation blocks save then).
 * Accepts any color-shaped list (WizardColor or ResolvedWizardColor) since it only touches `sizes`. */
export function resolveDefaultVariant(colors: { sizes: WizardSize[] }[]): WizardSize | null {
  const all = colors.flatMap((c) => c.sizes);
  if (all.length === 1) return all[0]!;
  return all.find((s) => s.isDefault) ?? null;
}

export function validateColors(colors: WizardColor[]): string | null {
  if (colors.length === 0) return "Add at least one colour.";
  const duplicate = duplicateColorNameIssue(colors);
  if (duplicate) return duplicate;
  for (const c of colors) {
    const issue = colorIssue(c);
    if (issue) return issue;
  }
  if (!resolveDefaultVariant(colors)) {
    return "Choose exactly one default variant - its price is shown as the product's price.";
  }
  return null;
}
