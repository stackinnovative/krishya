import { inject, injectable } from "tsyringe";
import type { IGetOrderStatusDistributionUseCase } from "./interfaces/get.order.status.use-case.interface.js";
import type { IOrderRepository } from "../../order/repositories/order.repository.interface.js";
import type { OrderStatusDistribution} from "../types/analysis.type.js";
import type { OrderStatus } from "../../order/types/order.type.js";

@injectable()
export class GetOrderStatusDistributionUseCase implements IGetOrderStatusDistributionUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository
    ) { }

    async execute(): Promise<OrderStatusDistribution> {
        // 1. Fetch the raw counts from the DB
        const rawCounts = await this._orderRepository.getOrderStatusCounts();

        // 2. Calculate the grand total of all orders
        const totalOrders = rawCounts.reduce((acc, curr) => acc + curr.count, 0);

        // 3. Define the strict visual order for the frontend donut chart colors
        const statusOrder: OrderStatus[] = [
            "created", 
            "confirmed", 
            "accepted", 
            "dispatched", 
            "delivered", 
            "cancelled"
        ];

        // 4. Map the data, calculate percentages, and enforce the sort order
        const statuses = rawCounts.map((item) => {
            const percentage = totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0;
            return {
                status: item._id as OrderStatus,
                count: item.count,
                percentage: percentage
            };
        }).sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

        return {
            totalOrders,
            statuses
        };
    }
}