export type ReportDateRangeOption =
  | "last_7_days"
  | "this_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "all_time"
  | "custom";

export type RevenueGranularity = "day" | "week" | "month";

export type RevenueSummary = { totalRevenue: number; totalOrders: number; averageOrderValue: number };
export type DailyRevenueData = { date: string; revenue: number; orders: number };

export type RevenueReportQuery = {
  option: ReportDateRangeOption;
  customStartDate?: string;
  customEndDate?: string;
  /** Forces day-level buckets regardless of range span, paired with page/limit for real pagination - used by the "full breakdown" drill-down. Overview omits this and gets adaptive bucketing (day/week/month) with every bucket returned at once. */
  detail?: boolean;
  page?: number;
  limit?: number;
};

export type RevenueReportResponse = {
  message: string;
  success: boolean;
  data: { summary: RevenueSummary; dailyData: DailyRevenueData[]; granularity: RevenueGranularity };
  totalPages: number;
  total: number;
  currentPage: number;
};
