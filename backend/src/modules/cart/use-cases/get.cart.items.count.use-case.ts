import { inject, injectable } from "tsyringe";
import type { ICartRepository } from "../repositories/cart.repository.interface.ts";
import type { IGetCartItemsCountUseCase } from "./interfaces/get.cart.items.count.use-case.interface.ts";

@injectable()
export class GetCartItemsCountUseCase implements IGetCartItemsCountUseCase {
    constructor(
        @inject("ICartRepository")
        private readonly cartRepository: ICartRepository
    ) { }

    async execute(guestId: string): Promise<number> {
        return this.cartRepository.getCartItemsCount(guestId);
    }
}