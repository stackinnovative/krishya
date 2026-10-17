import { z } from "zod";
import { ProductContentSchema } from "./create.product.dto.js";

export const EditProductSchema = ProductContentSchema.strict();

export type EditProductRequestDto = z.infer<typeof EditProductSchema>;
