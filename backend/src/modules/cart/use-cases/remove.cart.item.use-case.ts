import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import type { ICartRepository } from "../repositories/cart.repository.interface.js";
import type { RemoveCartItemRequestDto } from "../dtos/remove.cart.dto.js";
import type { IRemoveCartItemUseCase } from "./interfaces/remove.cart.item.use-case.interface.js";

@injectable()
export class RemoveCartItemUseCase implements IRemoveCartItemUseCase {
    constructor(
        @inject("ICartRepository")
        private readonly _cartRepository: ICartRepository,
    ) { }
    async execute(dto: RemoveCartItemRequestDto): Promise<void> {
        const { guestId, cartId, itemId } = dto;
        const cart = await this._cartRepository.findByGuestId(guestId);
        if (!cart) {
            throw new CustomError(
                ResponseMessages.CART_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }
        if (cart.id !== cartId) {
            throw new CustomError(
                ResponseMessages.CART_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }
        const item = cart.items.find((item) => item.id === itemId);
        if (!item) {
            throw new CustomError(
                ResponseMessages.ITEM_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }
        const removed = await this._cartRepository.removeItem({
            cartId,
            itemId,
            guestId,
        });
        if (!removed) {
            throw new CustomError(
                ResponseMessages.CART_UPDATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}   