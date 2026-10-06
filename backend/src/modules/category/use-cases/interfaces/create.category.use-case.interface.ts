import type { CreateCategoryRequestDto } from "../../dtos/create.category.dto.js";


export interface ICreateCategoryUseCase {
  execute(dto: CreateCategoryRequestDto): Promise<void>;
}