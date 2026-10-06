import { useQuery } from "@tanstack/react-query";
import { getAdminRevenueReportApi } from "../api/reports.api";
import type { RevenueReportQuery } from "../types/reports.type";

export const useRevenueReport = (query: RevenueReportQuery, enabled = true) =>
  useQuery({
    queryKey: ["admin-revenue-report", query],
    queryFn: () => getAdminRevenueReportApi(query),
    enabled,
  });
