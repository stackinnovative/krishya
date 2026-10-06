import { container } from "tsyringe";
import type { IGetRevenueChartUseCase } from "../modules/analysis/use-cases/interfaces/get.revenue.use-case.interface.js";
import { GetRevenueChartUseCase } from "../modules/analysis/use-cases/get.revenue.use-case.js";
import type { IGetKpiCardsUseCase } from "../modules/analysis/use-cases/interfaces/get.kpi.cards.use-case.interface.js";
import { GetKpiCardsUseCase } from "../modules/analysis/use-cases/get.kpi.cards.use-case.js";
import type { IGetProductRankingsUseCase } from "../modules/analysis/use-cases/interfaces/get.product.rankings.use-case.interface.js";
import { GetProductRankingsUseCase } from "../modules/analysis/use-cases/get.product.rankings.use-case.js";
import type { IGetCategoryRankingsUseCase } from "../modules/analysis/use-cases/interfaces/get.category.rankings.use-case.interface.js";
import { GetCategoryRankingsUseCase } from "../modules/analysis/use-cases/get.category.rankings.use-case.js";
import type { IGetMotivationUseCase } from "../modules/analysis/use-cases/interfaces/get.motivation.use-case.interface.js";
import { GetMotivationUseCase } from "../modules/analysis/use-cases/get.motivation.use-case.js";
import type { IGetOrderStatusDistributionUseCase } from "../modules/analysis/use-cases/interfaces/get.order.status.use-case.interface.js";
import { GetOrderStatusDistributionUseCase } from "../modules/analysis/use-cases/get.order.status.use-case.js";

 
export const registerAnalysisDependencies = () => {
     container.register<IGetRevenueChartUseCase>("IGetRevenueChartUseCase", {
        useClass: GetRevenueChartUseCase,
    });

    container.register<IGetKpiCardsUseCase>("IGetKpiCardsUseCase", {
        useClass: GetKpiCardsUseCase,
    });

    container.register<IGetProductRankingsUseCase>("IGetProductRankingsUseCase", {
        useClass: GetProductRankingsUseCase,
    });

    container.register<IGetCategoryRankingsUseCase>("IGetCategoryRankingsUseCase", {
        useClass: GetCategoryRankingsUseCase,
    });

    container.register<IGetMotivationUseCase>("IGetMotivationUseCase", {
        useClass: GetMotivationUseCase,
    });

    container.register<IGetOrderStatusDistributionUseCase>("IGetOrderStatusDistributionUseCase", {
        useClass: GetOrderStatusDistributionUseCase,
    });
}