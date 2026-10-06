import { Types } from "mongoose";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

import { Wishlist } from "../entities/wishlist.entity.js";
import { WishlistModel } from "../infrastructure/wishlist.schema.js";
import { WishlistMapper } from "../mappers/wishlist.mapper.js";
import type { IWishlistRepository } from "./wishlist.repository.interface.js";

const { ObjectId } = Types;

export class WishlistRepository implements IWishlistRepository {
  async create(wishlistEntity: Wishlist): Promise<Wishlist> {
    const persistenceData = WishlistMapper.toPersistence(wishlistEntity);

    const created = await WishlistModel.create(persistenceData);

    const domainWishlist = WishlistMapper.toDomain(created);
    if (!domainWishlist) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }

    return domainWishlist;
  }

  async findByGuestId(guestId: string): Promise<Wishlist | null> {
    const document = await WishlistModel.findOne({ guestId }).lean();
    return WishlistMapper.toDomain(document);
  }

  async addProduct(
    guestId: string,
    wishlistId: string,
    productId: string
  ): Promise<boolean> {
    if (!ObjectId.isValid(wishlistId)) return false;

    const updated = await WishlistModel.findOneAndUpdate(
      { _id: wishlistId, guestId },
      { $addToSet: { productIds: productId } },
      { new: false }
    ).lean();

    return !!updated;
  }

  async removeProduct(
    guestId: string,
    wishlistId: string,
    productId: string
  ): Promise<boolean> {
    if (!ObjectId.isValid(wishlistId)) return false;

    const updated = await WishlistModel.findOneAndUpdate(
      { _id: wishlistId, guestId },
      { $pull: { productIds: productId } },
      { new: false }
    ).lean();

    return !!updated;
  }

  async getProductIdsByGuestId(guestId: string): Promise<string[]> {
    const wishlist = await WishlistModel.findOne(
      { guestId },
      { productIds: 1 }
    ).lean();

    if (!wishlist) return [];

    return wishlist.productIds.map((id) => id.toString());
  }
}
