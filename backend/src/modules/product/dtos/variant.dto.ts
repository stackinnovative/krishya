import { z } from "zod";
import { ObjectIdSchema } from "../../../core/utils/object.id.validation.js";

export const VariantSchema = z.object({
  colorOptionId: ObjectIdSchema.optional(),

  size: z
    .string()
    .trim()
    .min(1, "Variant size is required")
    .max(9, "Variant size must be at most 9 characters"),

  stock: z
    .number()
    .int("Variant stock must be an integer")
    .min(0, "Variant stock cannot be negative"),

  price: z
    .number()
    .min(0, "Variant price cannot be negative"),

  isDefault: z.boolean().optional().default(false),
});

export const VariantArraySchema = z
  .array(VariantSchema)
  .min(1, "At least one product variant is required")
  .refine(
    (variants) => {
      const normalizedSizes = variants.map((v) =>
        v.size.trim().toLowerCase()
      );

      return new Set(normalizedSizes).size === normalizedSizes.length;
    },
    {
      message: "Variant sizes must be unique",
    }
  )
  .refine(
    (variants) => {
      const ids = new Set(
        variants.map((v) => v.colorOptionId).filter((id): id is string => !!id),
      );
      return ids.size <= 1;
    },
    {
      message: "All variants in one request must target the same color option",
    }
  );

export type AddVariantRequestDto = z.infer<
  typeof VariantSchema
>;

export const UpdateVariantSchema = z.object({
  stock: z
    .number()
    .int("Variant stock must be an integer")
    .min(0, "Variant stock cannot be negative")
  ,

  price: z
    .number()
    .min(0, "Variant price cannot be negative")
  ,

  isActive: z.boolean(),

  isDefault: z.boolean().optional().default(false),
});

export type UpdateVariantRequestDto = z.infer<typeof UpdateVariantSchema>;
