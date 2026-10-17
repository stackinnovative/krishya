import type { CategoryUserView } from "../../types/category.type.js";

export interface IGetSignatureCategoryUseCase {
    execute(): Promise<CategoryUserView[]>;
}   