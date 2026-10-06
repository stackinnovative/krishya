import { inject, injectable } from "tsyringe";

import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import { Wishlist } from "../entities/wishlist.entity.js";

import type { IToggleWishlistUseCase } from "./interfaces/toggle.wishlist.use-case.interface.js";
import type { IWishlistRepository } from "../repositories/wishlist.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";

import type { ToggleWishlistRequestDto } from "../dtos/toggle.wishlist.dto.js";

@injectable()
export class ToggleWishlistUseCase implements IToggleWishlistUseCase {
  constructor(
    @inject("IWishlistRepository")
    private readonly _wishlistRepository: IWishlistRepository,

    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository
  ) {}

  async execute(dto: ToggleWishlistRequestDto): Promise<{ added: boolean }> {
    /* ---------- product validation ---------- */
    const product = await this._productRepository.findById(dto.productId);

    if (!product || !product.isActive) {
      throw new CustomError(
        ResponseMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    /* ---------- find existing wishlist ---------- */
    let wishlist = await this._wishlistRepository.findByGuestId(dto.guestId);

    /* ---------- create wishlist if not exists ---------- */
    if (!wishlist) {
      const wishlistEntity = new Wishlist({
        id: null,
        userId: null,
        guestId: dto.guestId,
        productIds: [],
      });

      wishlist = await this._wishlistRepository.create(wishlistEntity);

      if (!wishlist) {
        throw new CustomError(
          ResponseMessages.WISHLIST_CREATE_FAILED,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
      }
    }

    const alreadyWishlisted = wishlist.has(dto.productId);

    if (alreadyWishlisted) {
      const removed = await this._wishlistRepository.removeProduct(
        dto.guestId,
        wishlist.id!,
        dto.productId
      );

      if (!removed) {
        throw new CustomError(
          ResponseMessages.WISHLIST_UPDATE_FAILED,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
      }

      return { added: false };
    }

    const added = await this._wishlistRepository.addProduct(
      dto.guestId,
      wishlist.id!,
      dto.productId
    );

    if (!added) {
      throw new CustomError(
        ResponseMessages.WISHLIST_UPDATE_FAILED,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }

    return { added: true };
  }
}
