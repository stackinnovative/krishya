import { inject, injectable } from "tsyringe";
import type { IGetCategoryRankingsUseCase } from "./interfaces/get.category.rankings.use-case.interface.js";
import type { IOrderRepository } from "../../order/repositories/order.repository.interface.js";
import type { TopSellingCategoriesResponse } from "../types/analysis.type.js";

@injectable()
export class GetCategoryRankingsUseCase implements IGetCategoryRankingsUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository
    ) { }

    async execute(): Promise<TopSellingCategoriesResponse> {
        const endDate = new Date();
        const startDate = new Date();
        // Exact 1 Year Window
        startDate.setFullYear(endDate.getFullYear() - 1);

        // Fetch Top 5 Categories
        const categories = await this._orderRepository.getTopSellingCategories(startDate, endDate, 5);

        return {
            range: "1y",
            categories: categories
        };
    }
}