import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import type { ICartRepository } from "../repositories/cart.repository.interface.js";
import type { UpdateCartItemQuantityRequestDto } from "../dtos/update.cart.dto.js";
import type { IUpdateCartCountUseCase } from "./interfaces/update.cart.count.use-case.interface.js";
import { inject, injectable } from "tsyringe";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";

@injectable()
export class UpdateCartCountUseCase implements IUpdateCartCountUseCase {
    constructor(
        @inject("ICartRepository")
        private readonly _cartRepository: ICartRepository,

        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository,
    ) { }
    async execute(dto: UpdateCartItemQuantityRequestDto): Promise<void> {
        const { guestId, cartId, itemId, action } = dto;
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

        const product = await this._productRepository.findById(item.productId);
        if (!product || !product.isActive) {
            throw new CustomError(
                ResponseMessages.PRODUCT_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }

        const productVariant = await this._productRepository.findProductVariant(product.id!, item.variantId);
        if (!productVariant || !productVariant.isActive) {
            throw new CustomError(
                ResponseMessages.PRODUCT_VARIANT_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }

        if (action === "increment" && productVariant.stock < (item.quantity + 1)) {
            throw new CustomError(
                ResponseMessages.OUT_OF_STOCK,
                HttpStatusCode.BAD_REQUEST
            );
        }

        if (action === "decrement" && item.quantity === 1) {
            const removeUpdate = await this._cartRepository.removeItem({
                cartId,
                itemId,
                guestId,
            });
            if (!removeUpdate) {
                throw new CustomError(
                    ResponseMessages.CART_UPDATE_FAILED,
                    HttpStatusCode.NOT_FOUND
                );
            }
            return;
        }

        if (action === "increment") {
            const incrementUpdate = await this._cartRepository.incrementItemQuantity({
                cartId,
                itemId,
                guestId,
                quantity: 1,
                stock: productVariant.stock,
            });

            if (!incrementUpdate) {
                throw new CustomError(
                    ResponseMessages.CART_UPDATE_FAILED,
                    HttpStatusCode.NOT_FOUND
                );
            }
        } else if (action === "decrement") {
            const decrementUpdate = await this._cartRepository.decrementItemQuantity({
                cartId,
                itemId,
                guestId,
                quantity: 1,
                stock: productVariant.stock,
            });

            if (!decrementUpdate) {
                throw new CustomError(
                    ResponseMessages.CART_UPDATE_FAILED,
                    HttpStatusCode.NOT_FOUND
                );
            }
        }

    }
}