import type { ICartRepository } from "../modules/cart/repositories/cart.repository.interface.js";
import { CartRepository } from "../modules/cart/repositories/cart.repository.js";
import { container } from "tsyringe";
import type { ICreateCartUseCase } from "../modules/cart/use-cases/interfaces/create.cart.use-case.interface.js";
import { CreateCartUseCase } from "../modules/cart/use-cases/create.cart.use-case.js";
import type { IGetCartUseCase } from "../modules/cart/use-cases/interfaces/get.cart.use-case.interface.js";
import { GetCartUseCase } from "../modules/cart/use-cases/get.cart.use-case.js";
import type { IRemoveCartItemUseCase } from "../modules/cart/use-cases/interfaces/remove.cart.item.use-case.interface.js";
import { RemoveCartItemUseCase } from "../modules/cart/use-cases/remove.cart.item.use-case.js";
import type { IUpdateCartCountUseCase } from "../modules/cart/use-cases/interfaces/update.cart.count.use-case.interface.js";
import { UpdateCartCountUseCase } from "../modules/cart/use-cases/update.cart.count.use-case.js";
import type { IGetCheckoutItemUseCase } from "../modules/cart/use-cases/interfaces/get.checkout.item.use-case.interface.js";
import { GetCheckoutItemUseCase } from "../modules/cart/use-cases/get.checkout.item.use-case.js";
import type { IGetCartItemsCountUseCase } from "../modules/cart/use-cases/interfaces/get.cart.items.count.use-case.interface.js";
import { GetCartItemsCountUseCase } from "../modules/cart/use-cases/get.cart.items.count.use-case.js";

export const registerCartDependencies = () => {
    container.register<ICartRepository>("ICartRepository", {
        useClass: CartRepository,
    });

    container.register<ICreateCartUseCase>("ICreateCartUseCase", {
        useClass: CreateCartUseCase,
    });

    container.register<IGetCartUseCase>("IGetCartUseCase", {
        useClass: GetCartUseCase,
    });

    container.register<IRemoveCartItemUseCase>("IRemoveCartItemUseCase", {
        useClass: RemoveCartItemUseCase,
    });

    container.register<IUpdateCartCountUseCase>("IUpdateCartCountUseCase", {
        useClass: UpdateCartCountUseCase,
    });

    container.register<IGetCheckoutItemUseCase>("IGetCheckoutItemUseCase", {
        useClass: GetCheckoutItemUseCase,
    });

    container.register<IGetCartItemsCountUseCase>("IGetCartItemsCountUseCase", {
        useClass: GetCartItemsCountUseCase,
    });

};