import { inject, injectable } from "tsyringe";

import type { GetRevenueQueryDto } from "../../analysis/dto/get.revenue.dto.js";
import type { IOrderRepository } from "../../order/repositories/order.repository.interface.js";
import type { RevenueChartData } from "../types/analysis.type.js";
import type { IGetRevenueChartUseCase } from "./interfaces/get.revenue.use-case.interface.js";


@injectable()
export class GetRevenueChartUseCase implements IGetRevenueChartUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository
    ) { }

    async execute(dto: GetRevenueQueryDto): Promise<RevenueChartData> {
        const { range } = dto;
        const endDate = new Date();
        const startDate = new Date();

        let categories: string[] = [];
        let data: number[] = [];

        // 1. Setup Timeframes & Categories based on Range
        switch (range) {
            case "Daily":
                // Last 24 hours grouped by 3-hour blocks
                startDate.setHours(endDate.getHours() - 24);
                categories = ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"];
                data = new Array(8).fill(0);
                break;
            case "Week":
                // Last 7 Days
                startDate.setDate(endDate.getDate() - 7);
                categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                data = new Array(7).fill(0);
                break;
            case "Month":
                // Last 30 Days grouped into 4 weeks
                startDate.setDate(endDate.getDate() - 30);
                categories = ["Week 1", "Week 2", "Week 3", "Week 4"];
                data = new Array(4).fill(0);
                break;
            case "Year":
                // Last 12 Months
                startDate.setFullYear(endDate.getFullYear() - 1);
                categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                data = new Array(12).fill(0);
                break;
            default:
                throw new Error("Invalid range provided");
        }

        // 2. Fetch Valid Orders from DB
        const orders = await this._orderRepository.getOrdersForRevenue(startDate, endDate);

        // 3. Bucket the Data
        orders.forEach((order) => {
            const orderDate = new Date(order.createdAt);
            let bucketIndex = 0;

            switch (range) {
                case "Daily":
                    // Group into 3-hour blocks (0-2, 3-5, 6-8, etc.)
                    bucketIndex = Math.floor(orderDate.getHours() / 3);
                    break;
                case "Week":
                    // 0 = Sunday, 1 = Monday. We map to 0=Mon ... 6=Sun
                    bucketIndex = orderDate.getDay() === 0 ? 6 : orderDate.getDay() - 1;
                    break;
                case "Month": {
                    // Rough week grouping (Days 1-7 = W1, 8-14 = W2, etc.)
                    const dayOfMonth = orderDate.getDate();
                    bucketIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
                    break;
                }
                case "Year":
                    // 0 = Jan, 11 = Dec
                    bucketIndex = orderDate.getMonth();
                    break;
            }

            // Safely add amount to the calculated bucket

            if (bucketIndex >= 0 && bucketIndex < data.length ) {
                data[bucketIndex]! += order.totalAmount;
            }
        });

        // 4. Return formatted for the Frontend component
        return {
            range: range,
            currency: "INR",
            categories: categories,
            series: {
                label: "Revenue",
                data: data,
            },
        };
    }
}
