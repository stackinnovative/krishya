import type { CategorySignature } from "../../types/category.type.js";

export interface IGetSignatureCategoryUseCase {
    execute(): Promise<CategorySignature[]>;
}   