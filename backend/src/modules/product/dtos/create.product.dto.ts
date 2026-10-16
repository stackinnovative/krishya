import { z } from "zod";
import { ObjectIdSchema } from "../../../core/utils/object.id.validation.js";
import { PRODUCT_LIMITS as L, PRODUCT_TYPES } from "../types/product.type.js";
import { ImageSchema } from "./image.dto.js";
import { VariantArraySchema } from "./variant.dto.js";

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} must not exceed ${max} characters`).optional().default("");

const IngredientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingredient name is required")
    .max(L.ingredientName, `Ingredient name must not exceed ${L.ingredientName} characters`),
  botanicalName: optionalText("Botanical name", L.botanicalName),
});

/** Everything on the product form except variants - shared by create and edit. */
export const ProductContentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(L.nameMin, `Product name must be at least ${L.nameMin} characters`)
    .max(L.name, `Product name must not exceed ${L.name} characters`),

  categoryId: ObjectIdSchema.trim(),

  type: z.enum(PRODUCT_TYPES, { message: "Select a product type" }),

  shortDescription: z
    .string()
    .trim()
    .min(1, "Short description is required")
    .max(L.shortDescription, `Short description must not exceed ${L.shortDescription} characters`),

  description: z
    .string()
    .trim()
    .min(L.descriptionMin, `Product description must be at least ${L.descriptionMin} characters`)
    .max(L.description, `Product description must not exceed ${L.description} characters`),

  ingredients: z
    .array(IngredientSchema)
    .max(L.ingredients, `List at most ${L.ingredients} ingredients`)
    .optional()
    .default([]),

  howToUse: optionalText("How to use", L.howToUse),
  storage: optionalText("Storage", L.storage),
  badge: optionalText("Badge", L.badge),

  images: z
    .array(ImageSchema)
    .min(1, "At least one product photo is required")
    .max(L.imagesMax, `Product photos must not exceed ${L.imagesMax}`),

  isFeatured: z.boolean().default(false),
});

export const CreateProductSchema = ProductContentSchema.extend({
  variants: VariantArraySchema.refine(
    (variants) => variants.length <= 1 || variants.filter((v) => v.isDefault).length === 1,
    { message: "Select exactly one default variant" },
  ),
});

export type CreateProductRequestDto = z.infer<typeof CreateProductSchema>;
