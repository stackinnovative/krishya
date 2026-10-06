import type { EditColorOptionRequestDto } from "../../dtos/color.option.dto.js";

export interface IEditColorOptionUseCase {
  execute(
    productId: string,
    colorOptionId: string,
    dto: EditColorOptionRequestDto,
  ): Promise<void>;
}
