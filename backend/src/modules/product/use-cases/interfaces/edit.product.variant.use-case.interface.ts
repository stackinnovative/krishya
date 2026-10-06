import type { UpdateVariantRequestDto } from "../../dtos/variant.dto.js";

export interface IEditProductVariantUseCase {
  execute(
    productId: string,
    variantId: string,
    dto: UpdateVariantRequestDto
  ): Promise<void>;
}