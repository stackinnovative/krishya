import { useQuery } from "@tanstack/react-query";
import {
  getCategoryRankingsApi,
  getKpiCardsApi,
  getMotivationSummaryApi,
  getOrderStatusDistributionApi,
  getProductRankingsApi,
  getRevenueChartApi,
} from "../api/dashboard.api";
import type { RevenueRange } from "../types/dashboard.type";

export const useRevenueChart = (range: RevenueRange) =>
  useQuery({ queryKey: ["revenue-chart", range], queryFn: () => getRevenueChartApi(range) });

export const useKpiCards = () => useQuery({ queryKey: ["kpi-cards"], queryFn: getKpiCardsApi });

export const useOrderStatusDistribution = () =>
  useQuery({ queryKey: ["order-status-distribution"], queryFn: getOrderStatusDistributionApi });

export const useProductRankings = () => useQuery({ queryKey: ["product-rankings"], queryFn: getProductRankingsApi });

export const useCategoryRankings = () => useQuery({ queryKey: ["category-rankings"], queryFn: getCategoryRankingsApi });

export const useMotivationSummary = () => useQuery({ queryKey: ["motivation-summary"], queryFn: getMotivationSummaryApi });
