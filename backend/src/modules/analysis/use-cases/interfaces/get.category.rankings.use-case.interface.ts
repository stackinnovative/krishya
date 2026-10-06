import type { TopSellingCategoriesResponse } from "../../types/analysis.type.js";

export interface IGetCategoryRankingsUseCase {
    execute(): Promise<TopSellingCategoriesResponse>;
}