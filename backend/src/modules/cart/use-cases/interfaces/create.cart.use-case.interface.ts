import type { AddCartItemRequestDto } from "../../dtos/create.cart.dto.js";


export interface ICreateCartUseCase {
  execute(dto: AddCartItemRequestDto): Promise<void>;
}