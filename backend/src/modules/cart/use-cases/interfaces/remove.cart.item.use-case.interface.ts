import type { RemoveCartItemRequestDto } from "../../dtos/remove.cart.dto.js";

export interface IRemoveCartItemUseCase {
    execute(dto: RemoveCartItemRequestDto): Promise<void>;
}