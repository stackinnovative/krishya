import type { OrderStatus } from "../../order/types/order.type.js";

export type RevenueRange = "Year" | "Month" | "Week" | "Daily";

export type RevenueChartData = {
    range: RevenueRange;
    currency: "INR" | "USD";
    series: {
        label: string;
        data: number[];
    };
    categories: string[];
};


export type DashboardKpiCardType = {
  key: "orders" | "revenue" | "users" | "pending_orders";
  label: string;
  value: number;
  formattedValue: string;
  trend?: {
    percentageChange: number;
    direction: "up" | "down";
    comparedTo: "last_month" | "last_week";
  };
  sparkline?: number[];
  action?: {
    label: string;
    href: string;
  };
};

export type TopAndLowSellingProductItem = {
  iconUrl:string
  productId: string;
  name: string;
  totalQuantitySold: number;
  totalRevenue: number;
};


export type TopAndLowSellingProducts = {
  range: "7d" | "30d" | "6m" | "1y";
  products: TopAndLowSellingProductItem[];
};

export type TopSellingCategoryItem = {
  iconUrl:string
  categoryId: string;
  name: string;
  totalQuantitySold: number;
  totalRevenue: number;
};

export type TopSellingCategoriesResponse = {
  range: "7d" | "30d" | "6m" | "1y";
  categories: TopSellingCategoryItem[];
};

export type DashboardMotivationSummary = {
  title: string;
  subtitle: string;
  metric: {
    value: number;
    formatted: string;
    type?: "revenue" | "orders"; 
  };
  target?: {
    value: number;
    progressPercentage: number;
  };
  comparison?: {
    percentageChange: number;
    comparedTo: "last_24_hours" | "last_week";
  };
  cta?: {
    label: string;
    path: string;
  };
};

export type OrderStatusDistribution = {
    totalOrders: number;
    statuses: {
        status: OrderStatus;
        count: number;
        percentage: number;
    }[];
};