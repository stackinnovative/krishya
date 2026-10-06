export type RevenueGranularity = "day" | "week" | "month";

export type GetRevenueReportPayload = {
    startDate: Date | null,
    endDate: Date | null,
    granularity: RevenueGranularity,
    // Omitted (both undefined) returns every bucket in the range, unpaginated -
    // used by the overview dashboard, where adaptive granularity already keeps
    // the bucket count small, and by CSV export, which needs the whole range
    // regardless of what page a paginated view happens to be on. Only the
    // "detail" (always-daily) drill-down table supplies both, for real paging.
    page?: number | undefined,
    limit?: number | undefined,
}

export type RevenueSummary = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
};


export type DailyRevenueData = {
  date: string;
  revenue: number;
  orders: number;
};



export type RevenueReportSummary = {
    summary: RevenueSummary
    totalPages: number
    total: number
    dailyData: DailyRevenueData[]
    granularity: RevenueGranularity
}