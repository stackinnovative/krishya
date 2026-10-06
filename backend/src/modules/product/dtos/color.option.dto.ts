import { z } from "zod";
import { ImageSchema } from "./image.dto.js";
import { VariantArraySchema } from "./variant.dto.js";

export const HexColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color");

export const ColorOptionSchema = z.object({
  colorName: z.string().trim().min(1).max(50).optional(),
  hex: HexColorSchema.optional(),
  images: z
    .array(ImageSchema)
    .min(1, "At least one color photo is required")
    .max(3, "Color photos must not exceed 3"),
  variants: VariantArraySchema,
});

export type AddColorOptionRequestDto = z.infer<typeof ColorOptionSchema>;

/** Same rules as ColorOptionSchema, but colorName is required — used where multiple
 * colors can be created together and an unnamed one would be ambiguous. */
export const RequiredNameColorOptionSchema = ColorOptionSchema.extend({
  colorName: z
    .string()
    .trim()
    .min(1, "Color name is required")
    .max(50, "Color name must not exceed 50 characters"),
});

export const EditColorOptionSchema = z
  .object({
    colorName: z.string().trim().min(1).max(50).optional(),
    hex: HexColorSchema.optional(),
    images: z.array(ImageSchema).min(1).max(3).optional(),
  })
  .refine(
    (data) =>
      data.colorName !== undefined ||
      data.hex !== undefined ||
      data.images !== undefined,
    { message: "At least one field must be provided" },
  );

export type EditColorOptionRequestDto = z.infer<typeof EditColorOptionSchema>;
