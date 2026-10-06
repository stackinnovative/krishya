import type { AddColorOptionRequestDto } from "../../dtos/color.option.dto.js";

export interface IAddColorOptionUseCase {
  execute(productId: string, dto: AddColorOptionRequestDto): Promise<void>;
}
