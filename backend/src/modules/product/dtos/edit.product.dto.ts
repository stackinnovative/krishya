import { z } from "zod";
import { ObjectIdSchema } from "../../../core/utils/object.id.validation.js";

export const EditProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(150, "Product name must not exceed 150 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Product description must be at least 10 characters")
    .max(1000, "Product description must not exceed 1000 characters"),
  isFeatured: z.boolean().default(false),

  categoryId: ObjectIdSchema.trim(),
}).strict();

export type EditProductRequestDto = z.infer<
  typeof EditProductSchema
>;
