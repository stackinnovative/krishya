import { inject, injectable } from "tsyringe";
import type { ICartRepository } from "../repositories/cart.repository.interface.js";
import type { CheckoutView } from "../types/cart.type.js";
import type { IGetCheckoutItemUseCase } from "./interfaces/get.checkout.item.use-case.interface.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

@injectable()
export class GetCheckoutItemUseCase implements IGetCheckoutItemUseCase {
    constructor(
        @inject("ICartRepository")
        private readonly _cartRepository: ICartRepository
    ) { }
    async execute(guestId: string): Promise<CheckoutView> {
        const cart = await this._cartRepository.getCheckoutViewByGuestId(guestId)
        if (!cart) {
            throw new CustomError(
                ResponseMessages.CART_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }
        return cart;
    }
}