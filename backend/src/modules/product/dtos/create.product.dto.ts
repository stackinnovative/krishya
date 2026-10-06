import { z } from "zod";
import { ObjectIdSchema } from "../../../core/utils/object.id.validation.js";
import { RequiredNameColorOptionSchema } from "./color.option.dto.js";

export const CreateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(150, "Product name must not exceed 150 characters"),
  isFeatured: z.boolean().default(false),
  description: z
    .string()
    .trim()
    .min(10, "Product description must be at least 10 characters")
    .max(1000, "Product description must not exceed 1000 characters"),

  categoryId: ObjectIdSchema
    .trim(),

  colorOptions: z
    .array(RequiredNameColorOptionSchema)
    .min(1, "At least one color is required")
    .refine(
      (colorOptions) => {
        const names = colorOptions.map((c) => c.colorName.trim().toLowerCase());
        return new Set(names).size === names.length;
      },
      { message: "Duplicate color name" },
    )
    .refine(
      (colorOptions) => {
        const variants = colorOptions.flatMap((c) => c.variants);
        if (variants.length <= 1) return true;
        return variants.filter((v) => v.isDefault).length === 1;
      },
      { message: "Select exactly one default variant" },
    ),
});

export type CreateProductRequestDto = z.infer<
  typeof CreateProductSchema
>;
