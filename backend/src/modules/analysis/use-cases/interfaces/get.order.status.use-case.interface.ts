import type { OrderStatusDistribution } from "../../types/analysis.type.js";

export interface IGetOrderStatusDistributionUseCase {
    execute(): Promise<OrderStatusDistribution>;
}