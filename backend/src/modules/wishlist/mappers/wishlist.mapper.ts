import { Wishlist } from "../entities/wishlist.entity.js";

export class WishlistMapper {
  /* ================= DOMAIN ================= */

  static toDomain(wishlistModelData: any): Wishlist | null {
    if (!wishlistModelData) return null;

    const idString =
      wishlistModelData._id?.toString() || wishlistModelData.id?.toString();

    if (!idString) {
      console.error("Wishlist data missing ID:", wishlistModelData);
      return null;
    }

    return new Wishlist({
      id: idString,
      userId: wishlistModelData.userId?.toString() || null,
      guestId: wishlistModelData.guestId || null,
      productIds: (wishlistModelData.productIds ?? []).map((id: any) =>
        id.toString()
      ),
    });
  }

  /* ================= PERSISTENCE ================= */

  static toPersistence(wishlistEntity: Wishlist): any {
    return {
      userId: wishlistEntity.userId,
      guestId: wishlistEntity.guestId,
      productIds: wishlistEntity.productIds,
    };
  }
}
