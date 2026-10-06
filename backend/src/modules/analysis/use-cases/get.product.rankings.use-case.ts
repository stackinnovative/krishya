import { inject, injectable } from "tsyringe";
import type { IGetProductRankingsUseCase } from "./interfaces/get.product.rankings.use-case.interface.js";
import type { IOrderRepository } from "../../order/repositories/order.repository.interface.js";
import type { TopAndLowSellingProducts } from "../types/analysis.type.js";

@injectable()
export class GetProductRankingsUseCase implements IGetProductRankingsUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository
    ) { }

    async execute(): Promise<{ topSelling: TopAndLowSellingProducts; lowSelling: TopAndLowSellingProducts }> {
        const endDate = new Date();
        const startDate = new Date();
        // Set to exactly 1 year ago
        startDate.setFullYear(endDate.getFullYear() - 1);

        // Fetch Top 5 (Sort -1)
        const topProducts = await this._orderRepository.getProductRankings(startDate, endDate, -1, 5);
        
        // Fetch Bottom 5 (Sort 1)
        const lowProducts = await this._orderRepository.getProductRankings(startDate, endDate, 1, 5);

        // Format to match exact DTO expected by frontend
        const topSelling: TopAndLowSellingProducts = {
            range: "1y",
            products: topProducts
        };

        const lowSelling: TopAndLowSellingProducts = {
            range: "1y",
            products: lowProducts
        };

        return { topSelling, lowSelling };
    }
}