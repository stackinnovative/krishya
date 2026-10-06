import type { UpdateCartItemQuantityRequestDto } from "../../dtos/update.cart.dto.js";

export interface IUpdateCartCountUseCase {
    execute(dto: UpdateCartItemQuantityRequestDto): Promise<void>;
}