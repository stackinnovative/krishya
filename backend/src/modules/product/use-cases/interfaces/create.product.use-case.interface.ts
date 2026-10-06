import type { CreateProductRequestDto } from "../../dtos/create.product.dto.js";

export interface ICreateProductUseCase {
  execute(dto: CreateProductRequestDto): Promise<void>;
}