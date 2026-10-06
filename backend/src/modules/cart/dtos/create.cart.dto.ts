import { z } from "zod";
import { ObjectIdSchema } from "../../../core/utils/object.id.validation.js";
import { GuestIdSchema } from "../../../core/utils/guest.id.validation.js";

export const AddCartItemSchema = z.object({

  guestId: GuestIdSchema,
  productId: ObjectIdSchema,
  variantId: ObjectIdSchema,
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity cannot exceed 20"),
});

export type AddCartItemRequestDto = z.infer<
  typeof AddCartItemSchema
>;
