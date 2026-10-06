import type { ApiResponse } from "@/shared/types/api.types";
import type { OrderStatus } from "@/modules/orders/types/order.type";

export type RevenueRange = "Year" | "Month" | "Week" | "Daily";

export type DashboardMotivationSummary = {
  title: string;
  subtitle: string;
  metric: { value: number; formatted: string; type?: "revenue" | "orders" };
  target?: { value: number; progressPercentage: number };
  comparison?: { percentageChange: number; comparedTo: "last_24_hours" | "last_week" };
  cta?: { label: string; path: string };
};

export type DashboardKpiCardType = {
  key: "orders" | "revenue" | "users" | "pending_orders";
  label: string;
  value: number;
  formattedValue: string;
  trend?: { percentageChange: number; direction: "up" | "down"; comparedTo: "last_month" | "last_week" };
  sparkline?: number[];
  action?: { label: string; href: string };
};

export type OrderStatusDistribution = {
  totalOrders: number;
  statuses: { status: OrderStatus; count: number; percentage: number }[];
};

export type TopAndLowSellingProductItem = {
  iconUrl: string;
  productId: string;
  name: string;
  totalQuantitySold: number;
  totalRevenue: number;
};

export type TopAndLowSellingProducts = { range: "7d" | "30d" | "6m" | "1y"; products: TopAndLowSellingProductItem[] };

export type TopSellingCategoryItem = {
  iconUrl: string;
  categoryId: string;
  name: string;
  totalQuantitySold: number;
  totalRevenue: number;
};

export type TopSellingCategories = { range: "7d" | "30d" | "6m" | "1y"; categories: TopSellingCategoryItem[] };

export type RevenueChartData = {
  range: RevenueRange;
  currency: "INR" | "USD";
  series: { label: string; data: number[] };
  categories: string[];
};

export type ProductRankingItems = { topSelling: TopAndLowSellingProducts; lowSelling: TopAndLowSellingProducts };

export type RevenueChartResponse = ApiResponse<RevenueChartData>;
export type KpiCardsResponse = ApiResponse<DashboardKpiCardType[]>;
export type OrderStatusDistributionResponse = ApiResponse<OrderStatusDistribution>;
export type ProductRankingsResponse = ApiResponse<ProductRankingItems>;
export type CategoryRankingsResponse = ApiResponse<TopSellingCategories>;
export type MotivationSummaryResponse = ApiResponse<DashboardMotivationSummary>;
