import type { CartView } from "../../types/cart.type.js";

export interface IGetCartUseCase {
    execute(guestId: string): Promise<CartView>;
}