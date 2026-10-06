import { z } from "zod";
import { ObjectIdSchema } from "../../../core/utils/object.id.validation.js";
import { GuestIdSchema } from "../../../core/utils/guest.id.validation.js";

export const RemoveCartItemSchema = z.object({
    guestId: GuestIdSchema,

    cartId: ObjectIdSchema,

    itemId: ObjectIdSchema,
});

export type RemoveCartItemRequestDto = z.infer<
    typeof RemoveCartItemSchema
>;