import { inject, injectable } from "tsyringe";
import type { IWishlistRepository } from "../repositories/wishlist.repository.interface.js";
import type { IGetWishlistIdsUseCase } from "./interfaces/get.wishlist.ids.use-case.interface.js";

@injectable()
export class GetWishlistIdsUseCase implements IGetWishlistIdsUseCase {
  constructor(
    @inject("IWishlistRepository")
    private readonly _wishlistRepository: IWishlistRepository
  ) {}

  async execute(guestId: string): Promise<string[]> {
    return this._wishlistRepository.getProductIdsByGuestId(guestId);
  }
}
