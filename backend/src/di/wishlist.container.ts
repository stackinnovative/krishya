import type { IWishlistRepository } from "../modules/wishlist/repositories/wishlist.repository.interface.js";
import { WishlistRepository } from "../modules/wishlist/repositories/wishlist.repository.js";
import { container } from "tsyringe";
import type { IToggleWishlistUseCase } from "../modules/wishlist/use-cases/interfaces/toggle.wishlist.use-case.interface.js";
import { ToggleWishlistUseCase } from "../modules/wishlist/use-cases/toggle.wishlist.use-case.js";
import type { IGetWishlistUseCase } from "../modules/wishlist/use-cases/interfaces/get.wishlist.use-case.interface.js";
import { GetWishlistUseCase } from "../modules/wishlist/use-cases/get.wishlist.use-case.js";
import type { IGetWishlistIdsUseCase } from "../modules/wishlist/use-cases/interfaces/get.wishlist.ids.use-case.interface.js";
import { GetWishlistIdsUseCase } from "../modules/wishlist/use-cases/get.wishlist.ids.use-case.js";

export const registerWishlistDependencies = () => {
    container.register<IWishlistRepository>("IWishlistRepository", {
        useClass: WishlistRepository,
    });

    container.register<IToggleWishlistUseCase>("IToggleWishlistUseCase", {
        useClass: ToggleWishlistUseCase,
    });

    container.register<IGetWishlistUseCase>("IGetWishlistUseCase", {
        useClass: GetWishlistUseCase,
    });

    container.register<IGetWishlistIdsUseCase>("IGetWishlistIdsUseCase", {
        useClass: GetWishlistIdsUseCase,
    });

};
