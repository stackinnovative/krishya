import type { CategoryUserView } from "../../types/category.type.js";

export interface IGetAllActiveCategoryUseCase {
  execute(): Promise<CategoryUserView[]>;
}
