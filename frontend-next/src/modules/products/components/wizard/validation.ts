import { PRODUCT_LIMITS as L } from "../../constants/product-options";
import type { WizardDetails, WizardImages, WizardTabs, WizardVariant } from "./wizard.types";

/** Mirrors backend/src/modules/product/entities/product.entity.ts and dtos/*.dto.ts 1:1, so the wizard never round-trips to the server just to learn a value is invalid. */
export function validateDetails(details: WizardDetails): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = details.name.trim();
  if (!name) errors.name = "Product name is required.";
  else if (name.length < L.nameMin || name.length > L.name) errors.name = `Product name must be between ${L.nameMin} and ${L.name} characters.`;

  if (!details.categoryId) errors.categoryId = "Choose a category.";
  if (!details.type) errors.type = "Choose a product type.";

  const short = details.shortDescription.trim();
  if (!short) errors.shortDescription = "Short description is required.";
  else if (short.length > L.shortDescription) errors.shortDescription = `Short description cannot exceed ${L.shortDescription} characters.`;

  const description = details.description.trim();
  if (!description) errors.description = "Description is required.";
  else if (description.length < L.descriptionMin || description.length > L.description) {
    errors.description = `Description must be between ${L.descriptionMin} and ${L.description} characters.`;
  }

  if (details.badge.trim().length > L.badge) errors.badge = `Badge cannot exceed ${L.badge} characters.`;

  return errors;
}

/** Ingredients, How to Use and Storage are all optional - only an ingredient row that's half filled in is an error. */
export function ingredientError(tabs: WizardTabs, index: number): string | undefined {
  const row = tabs.ingredients[index]!;
  if (!row.name.trim() && row.botanicalName.trim()) return "Add the ingredient name, or clear this row.";
  return undefined;
}

export function validateTabs(tabs: WizardTabs): string | null {
  if (tabs.ingredients.length > L.ingredients) return `List at most ${L.ingredients} ingredients.`;
  if (tabs.ingredients.some((_, i) => ingredientError(tabs, i))) return "Every ingredient row needs a name.";
  if (tabs.howToUse.trim().length > L.howToUse) return `How to use cannot exceed ${L.howToUse} characters.`;
  if (tabs.storage.trim().length > L.storage) return `Storage cannot exceed ${L.storage} characters.`;
  return null;
}

const toNumber = (v: string) => (v.trim() === "" ? NaN : Number(v));
const sizeKey = (v: WizardVariant) => `${toNumber(v.quantity)}|${v.unit}`;

/** Per-field messages for one quantity row - undefined means that field is valid. */
export function variantFieldErrors(variants: WizardVariant[], index: number): Partial<Record<"quantity" | "mrp" | "price" | "stock", string>> {
  const row = variants[index]!;
  const quantity = toNumber(row.quantity);
  const mrp = toNumber(row.mrp);
  const price = toNumber(row.price);
  const stock = toNumber(row.stock);
  const duplicate = !Number.isNaN(quantity) && variants.some((v, i) => i !== index && sizeKey(v) === sizeKey(row));

  return {
    quantity: !(quantity > 0) ? "Quantity must be more than 0." : duplicate ? "This quantity is already listed." : undefined,
    mrp: !(mrp > 0) ? "MRP must be more than 0." : undefined,
    price: !(price > 0) ? "Price must be more than 0." : mrp > 0 && price > mrp ? "Price can't be more than the MRP." : undefined,
    stock: Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock) ? "Stock must be a whole number, 0 or more." : undefined,
  };
}

/** The row whose price shows as the product's price: the only row, or whichever one is flagged. */
export function resolveDefaultVariant(variants: WizardVariant[]): WizardVariant | null {
  if (variants.length === 1) return variants[0]!;
  return variants.find((v) => v.isDefault) ?? null;
}

export function validateImagesAndVariants(images: WizardImages, variants: WizardVariant[]): string | null {
  if (images.length === 0) return "Add at least one product photo.";
  if (images.length > L.imagesMax) return `A product can have at most ${L.imagesMax} photos.`;
  if (variants.length === 0) return "Add at least one quantity.";
  if (variants.length > L.variantsMax) return `A product can have at most ${L.variantsMax} quantities.`;
  if (variants.some((_, i) => Object.values(variantFieldErrors(variants, i)).some(Boolean))) return "Please fix the highlighted quantities.";
  if (!resolveDefaultVariant(variants)) return "Choose the default quantity - its price is shown as the product's price.";
  return null;
}

/**
 * Preview of the "% off" the backend will store - same formula (rounded down)
 * as backend/src/modules/product/utils/variant.helper.ts. Only shown inside
 * the admin form; the storefront always reads the saved value.
 */
export function previewDiscountPercent(mrp: number, price: number): number {
  if (!(mrp > 0) || !(price > 0) || price >= mrp) return 0;
  return Math.floor(((mrp - price) / mrp) * 100 + 1e-9);
}
