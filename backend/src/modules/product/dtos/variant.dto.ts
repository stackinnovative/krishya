import { z } from "zod";
import { PRODUCT_LIMITS as L, VARIANT_UNITS } from "../types/product.type.js";
import { hasDuplicateVariantSizes } from "../utils/variant.helper.js";

export const VariantSchema = z
  .object({
    quantity: z
      .number()
      .positive("Quantity must be more than 0")
      .max(L.quantityMax, `Quantity must not exceed ${L.quantityMax}`),

    unit: z.enum(VARIANT_UNITS, { message: "Select a unit" }),

    mrp: z.number().positive("MRP must be more than 0"),

    price: z.number().positive("Price must be more than 0"),

    stock: z
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),

    isActive: z.boolean().optional().default(true),

    isDefault: z.boolean().optional().default(false),
  })
  .refine((v) => v.price <= v.mrp, {
    message: "Price cannot be more than the MRP",
    path: ["price"],
  });

export const VariantArraySchema = z
  .array(VariantSchema)
  .min(1, "At least one product variant is required")
  .max(L.variantsMax, `A product can have at most ${L.variantsMax} variants`)
  .refine((variants) => !hasDuplicateVariantSizes(variants), {
    message: "Two variants cannot have the same quantity and unit",
  })
  .refine((variants) => variants.filter((v) => v.isDefault).length <= 1, {
    message: "Select only one default variant",
  });

export type AddVariantRequestDto = z.infer<typeof VariantSchema>;

export const UpdateVariantSchema = VariantSchema;

export type UpdateVariantRequestDto = z.infer<typeof UpdateVariantSchema>;
