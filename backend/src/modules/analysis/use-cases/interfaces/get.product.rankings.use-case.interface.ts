import type { TopAndLowSellingProducts } from "../../types/analysis.type.js";

export interface IGetProductRankingsUseCase {
    execute(): Promise<{
        topSelling: TopAndLowSellingProducts;
        lowSelling: TopAndLowSellingProducts;
    }>;
}