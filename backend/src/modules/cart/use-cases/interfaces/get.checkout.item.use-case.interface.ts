import type { CheckoutView } from "../../types/cart.type.js";

export interface IGetCheckoutItemUseCase {
    execute(guestId: string): Promise<CheckoutView | null>;
}