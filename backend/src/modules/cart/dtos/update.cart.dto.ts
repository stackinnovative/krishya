import { z } from "zod";
import { ObjectIdSchema } from "../../../core/utils/object.id.validation.js";
import { GuestIdSchema } from "../../../core/utils/guest.id.validation.js";

export const UpdateCartItemQuantitySchema = z.object({
    guestId: GuestIdSchema,

    cartId: ObjectIdSchema,

    itemId: ObjectIdSchema,

    action: z.enum(["increment", "decrement"], {
        message: "Invalid action",
    }),
});

export type UpdateCartItemQuantityRequestDto = z.infer<
    typeof UpdateCartItemQuantitySchema
>;