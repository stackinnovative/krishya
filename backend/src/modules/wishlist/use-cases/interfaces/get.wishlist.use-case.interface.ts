import type { UserProductListView } from "../../../product/types/product.type.js";

export interface IGetWishlistUseCase {
  execute(guestId: string): Promise<UserProductListView[]>;
}
