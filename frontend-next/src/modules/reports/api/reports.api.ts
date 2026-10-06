import api from "@/lib/api-client";
import type { RevenueReportQuery, RevenueReportResponse } from "../types/reports.type";

export const getAdminRevenueReportApi = async (query: RevenueReportQuery): Promise<RevenueReportResponse> => {
  const response = await api.get<RevenueReportResponse>("/reports/revenue", { params: query });
  return response.data;
};
