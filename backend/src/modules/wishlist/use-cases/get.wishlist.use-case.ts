import { inject, injectable } from "tsyringe";

import type { IGetWishlistUseCase } from "./interfaces/get.wishlist.use-case.interface.js";
import type { IWishlistRepository } from "../repositories/wishlist.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { UserProductListView } from "../../product/types/product.type.js";

@injectable()
export class GetWishlistUseCase implements IGetWishlistUseCase {
  constructor(
    @inject("IWishlistRepository")
    private readonly _wishlistRepository: IWishlistRepository,

    @inject("IProductRepository")
    private readonly _productRepository: IProductRepository
  ) {}

  async execute(guestId: string): Promise<UserProductListView[]> {
    const productIds = await this._wishlistRepository.getProductIdsByGuestId(
      guestId
    );

    if (productIds.length === 0) return [];

    return this._productRepository.findByIds(productIds);
  }
}
