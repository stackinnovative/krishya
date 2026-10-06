import { inject, injectable } from "tsyringe";
import type { IGetKpiCardsUseCase } from "./interfaces/get.kpi.cards.use-case.interface.js";
import type { IOrderRepository } from "../../order/repositories/order.repository.interface.js";
import type { DashboardKpiCardType } from "../types/analysis.type.js";

@injectable()
export class GetKpiCardsUseCase implements IGetKpiCardsUseCase {
  constructor(
    @inject("IOrderRepository")
    private readonly _orderRepository: IOrderRepository,
  ) {}

  // Helper to calculate percentage change safely
  private calculateTrend(current: number, previous: number) {
    if (previous === 0) {
      return {
        percentageChange: current > 0 ? 100 : 0,
        direction: "up" as const,
        comparedTo: "last_month" as const,
      };
    }
    const change = ((current - previous) / previous) * 100;
    return {
      percentageChange: Math.abs(Math.round(change)),
      direction: change >= 0 ? ("up" as const) : ("down" as const),
      comparedTo: "last_month" as const,
    };
  }

  // Helper to format currency
  private formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  async execute(): Promise<DashboardKpiCardType[]> {
    const now = new Date();

    // Timeframes
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // 1. Fetch Current Data (Last 30 Days)
    const currentOrderStats = await this._orderRepository.getAggregateKpiStats(
      thirtyDaysAgo,
      now,
    );
    const currentUserCount = await this._orderRepository.getNewUsersCount(
      thirtyDaysAgo,
      now,
    );

    // 2. Fetch Previous Data (Day 31 to 60) for Trend Calculation
    const prevOrderStats = await this._orderRepository.getAggregateKpiStats(
      sixtyDaysAgo,
      thirtyDaysAgo,
    );
    const prevUserCount = await this._orderRepository.getNewUsersCount(
      sixtyDaysAgo,
      thirtyDaysAgo,
    );

    // 3. Fetch Sparkline Data (Last 7 Days)
    const dailyOrderStats = await this._orderRepository.getDailyKpiStats(
      sevenDaysAgo,
      now,
    );
    const dailyUserStats = await this._orderRepository.getDailyNewUsers(
      sevenDaysAgo,
      now,
    );

    // 4. Fetch Pending Orders Count (Snapshot right now)
    const pendingOrdersCount =
      await this._orderRepository.getPendingOrdersCount();

    // --- Sparkline Padding Logic ---
    // Ensures the sparkline has exactly 7 days of data, filling missing days with 0
    const sparklineDates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const ordersSparkline = sparklineDates.map(
      (date) => dailyOrderStats.find((d) => d._id === date)?.orders || 0,
    );
    const revenueSparkline = sparklineDates.map(
      (date) => dailyOrderStats.find((d) => d._id === date)?.revenue || 0,
    );
    const usersSparkline = sparklineDates.map(
      (date) => dailyUserStats.find((d) => d._id === date)?.count || 0,
    );

    // 5. Build the Output Array
    return [
      {
        key: "orders",
        label: "Total Orders",
        value: currentOrderStats.totalOrders,
        formattedValue: currentOrderStats.totalOrders.toString(),
        trend: this.calculateTrend(
          currentOrderStats.totalOrders,
          prevOrderStats.totalOrders,
        ),
        sparkline: ordersSparkline,
      },
      {
        key: "revenue",
        label: "Total Revenue",
        value: currentOrderStats.totalRevenue,
        formattedValue: this.formatCurrency(currentOrderStats.totalRevenue),
        trend: this.calculateTrend(
          currentOrderStats.totalRevenue,
          prevOrderStats.totalRevenue,
        ),
        sparkline: revenueSparkline,
      },
      {
        key: "users",
        label: "New Users",
        value: currentUserCount,
        formattedValue: currentUserCount.toString(),
        trend: this.calculateTrend(currentUserCount, prevUserCount),
        sparkline: usersSparkline,
      },
      {
        key: "pending_orders",
        label: "Pending Orders",
        value: pendingOrdersCount,
        formattedValue: pendingOrdersCount.toString(),
        action: {
          label: "Manage Orders",
          href: "/admin/orderManagement",
        },
      },
    ];
  }
}
