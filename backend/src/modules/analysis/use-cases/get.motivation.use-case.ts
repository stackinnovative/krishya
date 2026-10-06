import { inject, injectable } from "tsyringe";
import type { IGetMotivationUseCase } from "./interfaces/get.motivation.use-case.interface.js";
import type { IOrderRepository } from "../../order/repositories/order.repository.interface.js";
import type { DashboardMotivationSummary } from "../types/analysis.type.js";

@injectable()
export class GetMotivationUseCase implements IGetMotivationUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository
    ) {}

    private formatCurrency(amount: number) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    }

    private formatNumber(count: number) {
        return new Intl.NumberFormat("en-IN").format(count);
    }

    private calculatePercentage(current: number, previous: number): number {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    }

    private calculateNextTarget(current: number, type: "revenue" | "orders"): { value: number, progress: number } {
        if (current === 0) return { value: type === "revenue" ? 10000 : 50, progress: 0 };
        
        // Dynamically find the next nice round number milestone
        const magnitude = Math.pow(10, Math.floor(Math.log10(current)));
        let target = (Math.floor(current / magnitude) + 1) * magnitude;
        
        // Minor adjustment for small order counts to avoid targets jumping too high
        if (type === "orders" && target <= 10) target = 10;
        else if (type === "orders" && target <= 50) target = 50;

        return { 
            value: target, 
            progress: Math.round((current / target) * 100) 
        };
    }

    async execute(): Promise<DashboardMotivationSummary> {
        const now = new Date();
        
        // Rolling timeframes
        const last24hStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const prev24hStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const last7dStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const prev7dStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Fetch all 4 aggregates concurrently
        const [last24h, prev24h, last7d, prev7d] = await Promise.all([
            this._orderRepository.getAggregateKpiStats(last24hStart, now),
            this._orderRepository.getAggregateKpiStats(prev24hStart, last24hStart),
            this._orderRepository.getAggregateKpiStats(last7dStart, now),
            this._orderRepository.getAggregateKpiStats(prev7dStart, last7dStart),
        ]);

        // CONDITION 1: Last 24 Hours Revenue > Previous 24 Hours Revenue
        if (last24h.totalRevenue > prev24h.totalRevenue) {
            return {
                title: "Incredible day so far! 🚀",
                subtitle: "Revenue is up compared to the previous 24 hours.",
                metric: {
                    value: last24h.totalRevenue,
                    formatted: this.formatCurrency(last24h.totalRevenue),
                    type: "revenue",
                },
                comparison: {
                    percentageChange: this.calculatePercentage(last24h.totalRevenue, prev24h.totalRevenue),
                    comparedTo: "last_24_hours",
                },
                cta: { label: "View Reports", path: "/admin/reports" },
            };
        }

        // CONDITION 2: Last 7 Days Revenue > Previous 7 Days Revenue
        if (last7d.totalRevenue > prev7d.totalRevenue) {
            return {
                title: "Great momentum this week 📈",
                subtitle: "Revenue is growing steadily compared to last week.",
                metric: {
                    value: last7d.totalRevenue,
                    formatted: this.formatCurrency(last7d.totalRevenue),
                    type: "revenue",
                },
                comparison: {
                    percentageChange: this.calculatePercentage(last7d.totalRevenue, prev7d.totalRevenue),
                    comparedTo: "last_week",
                },
                cta: { label: "View Reports", path: "/admin/reports" },
            };
        }

        // CONDITION 3: Last 24 Hours Orders > Previous 24 Hours Orders
        if (last24h.totalOrders > prev24h.totalOrders) {
            return {
                title: "Orders are flying in! 📦",
                subtitle: "You've received more orders than the previous 24 hours.",
                metric: {
                    value: last24h.totalOrders,
                    formatted: this.formatNumber(last24h.totalOrders),
                    type: "orders",
                },
                comparison: {
                    percentageChange: this.calculatePercentage(last24h.totalOrders, prev24h.totalOrders),
                    comparedTo: "last_24_hours",
                },
                cta: { label: "Manage Orders", path: "/admin/orders" },
            };
        }

        // CONDITION 4: Last 7 Days Orders > Previous 7 Days Orders
        if (last7d.totalOrders > prev7d.totalOrders) {
            return {
                title: "Busy week ahead! 🔥",
                subtitle: "Order volume is up compared to last week.",
                metric: {
                    value: last7d.totalOrders,
                    formatted: this.formatNumber(last7d.totalOrders),
                    type: "orders",
                },
                comparison: {
                    percentageChange: this.calculatePercentage(last7d.totalOrders, prev7d.totalOrders),
                    comparedTo: "last_week",
                },
                cta: { label: "Manage Orders", path: "/admin/orders" },
            };
        }

        // CONDITION 5: Fallback (Set a target for the current week's revenue)
        const targetData = this.calculateNextTarget(last7d.totalRevenue, "revenue");
        
        return {
            title: "Keep pushing forward 💪",
            subtitle: "Every big business is built day by day. Keep up the hustle.",
            metric: {
                value: last7d.totalRevenue,
                formatted: this.formatCurrency(last7d.totalRevenue),
                type: "revenue",
            },
            target: {
                value: targetData.value,
                progressPercentage: targetData.progress,
            },
            cta: { label: "View Reports", path: "/admin/reports" },
        };
    }
}