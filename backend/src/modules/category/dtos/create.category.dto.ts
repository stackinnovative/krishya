import { z } from "zod";
import { CATEGORY_ICON_NAMES, CATEGORY_LIMITS } from "../types/category.type.js";

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(200, "Category description must not exceed 200 characters")
    .optional()
    .default(""),

  icon: z.enum(CATEGORY_ICON_NAMES, { message: "Invalid icon selected" }),

  sortOrder: z
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative")
    .max(CATEGORY_LIMITS.sortOrderMax, `Sort order must not exceed ${CATEGORY_LIMITS.sortOrderMax}`)
    .optional()
    .default(0),
});

export type CreateCategoryRequestDto = z.infer<
  typeof CreateCategorySchema
>;
