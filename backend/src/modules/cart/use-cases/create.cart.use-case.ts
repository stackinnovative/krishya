import { inject, injectable } from "tsyringe";

import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import { Cart } from "../entities/cart.entity.js";

import type { ICreateCartUseCase } from "./interfaces/create.cart.use-case.interface.js";
import type { ICartRepository } from "../repositories/cart.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";

import type { AddCartItemRequestDto } from "../dtos/create.cart.dto.js";

@injectable()
export class CreateCartUseCase implements ICreateCartUseCase {
  constructor(
    @inject("ICartRepository")
    private readonly _cartRepository: ICartRepository,

    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository
  ) { }

  async execute(dto: AddCartItemRequestDto): Promise<void> {

    /* ---------- product validation ---------- */
    const product = await this._productRepository.findById(dto.productId);

    if (!product || !product.isActive) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    /* ---------- variant + stock validation ---------- */

    const stockAvailable = await this._productRepository.findProductVariant(dto.productId, dto.variantId, true);


    if (!stockAvailable || stockAvailable.stock < dto.quantity) {
      throw new CustomError(
        ResponseMessages.OUT_OF_STOCK,
        HttpStatusCode.BAD_REQUEST
      );
    }

    const stock = stockAvailable.stock;
    /* ---------- find existing cart ---------- */
    let cart = await this._cartRepository.findByGuestId(dto.guestId);

    /* ---------- create cart if not exists ---------- */
    if (!cart) {
      const cartEntity = new Cart({
        id: null,
        userId: null,
        guestId: dto.guestId,
        isActive: true,
        items: [],
      });

      cart = await this._cartRepository.create(cartEntity);

      if (!cart) {
        throw new CustomError(
          ResponseMessages.CART_CREATE_FAILED,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
      }
    }

    const sameItemInCart = cart.findSameItemInCart(dto.productId, dto.variantId);

    if (sameItemInCart) {
      const updatedQuantity = dto.quantity + sameItemInCart.quantity;
      if (updatedQuantity > stockAvailable.stock) {
        throw new CustomError(
          ResponseMessages.OUT_OF_STOCK,
          HttpStatusCode.BAD_REQUEST
        );
      }


      const updated = await this._cartRepository.incrementItemQuantity({
        cartId: cart.id!,
        guestId: dto.guestId,
        itemId: sameItemInCart.id!,
        quantity: dto.quantity,
        stock,
      });
      if (!updated) {
        throw new CustomError(
          ResponseMessages.CART_UPDATE_FAILED,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
      }

    } else {

      const updated = await this._cartRepository.pushNewItem({
        cartId: cart.id!,
        guestId: dto.guestId,
        stock,
        item: {
          productId: dto.productId,
          variantId: dto.variantId,
          quantity: dto.quantity,
        },
      });

      if (!updated) {
        throw new CustomError(
          ResponseMessages.CART_UPDATE_FAILED,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
      }


    }
  }
}
