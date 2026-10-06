import type { CreateCategoryRequestDto } from "../../dtos/create.category.dto.js";

export interface IEditCategoryUseCase {
  execute(id: string, dto: CreateCategoryRequestDto): Promise<void>;
}