import { z } from "zod";
import { ObjectIdSchema } from "../../../core/utils/object.id.validation.js";
import { GuestIdSchema } from "../../../core/utils/guest.id.validation.js";

export const ToggleWishlistSchema = z.object({
  guestId: GuestIdSchema,
  productId: ObjectIdSchema,
});

export type ToggleWishlistRequestDto = z.infer<typeof ToggleWishlistSchema>;
