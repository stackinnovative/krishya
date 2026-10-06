import { Wishlist } from "../entities/wishlist.entity.js";

export interface IWishlistRepository {
  create(wishlistEntity: Wishlist): Promise<Wishlist>;
  findByGuestId(guestId: string): Promise<Wishlist | null>;
  addProduct(
    guestId: string,
    wishlistId: string,
    productId: string
  ): Promise<boolean>;
  removeProduct(
    guestId: string,
    wishlistId: string,
    productId: string
  ): Promise<boolean>;
  getProductIdsByGuestId(guestId: string): Promise<string[]>;
}
