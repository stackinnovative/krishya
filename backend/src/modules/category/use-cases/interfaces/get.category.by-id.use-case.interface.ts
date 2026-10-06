import type { Category } from "../../entities/category.entity.js";

export interface IGetCategoryByIdUseCase {
  execute(id: string): Promise<Category>;
}