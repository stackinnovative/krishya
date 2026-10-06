import type { AddVariantRequestDto } from "../../dtos/variant.dto.js"; 

export interface IAddProductVariantUseCase {
  execute(
    productId: string,
    dto: AddVariantRequestDto[]
  ): Promise<void>;
}