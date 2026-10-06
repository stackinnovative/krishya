
import { inject, injectable } from "tsyringe";
import type { ICartRepository } from "../repositories/cart.repository.interface.js";
import type { CartView } from "../types/cart.type.js";
import type { IGetCartUseCase } from "./interfaces/get.cart.use-case.interface.js";

@injectable()
export class GetCartUseCase implements IGetCartUseCase {
    constructor(
        @inject("ICartRepository")
        private readonly _cartRepository: ICartRepository
    ) { }
    async execute(guestId: string): Promise<CartView> {
        const cart = await this._cartRepository.findCartForViewByGuestId(guestId);
        if (!cart) {
            return {
                id: '',
                guestId: '',
                items: [],
                totalItems: 0,
                totalPrice: 0,
                deliveryCharge: 0,
                total: 0,
            }
        }

        return cart;
    }
}