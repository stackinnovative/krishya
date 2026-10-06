import api from "@/lib/api-client";
import type {
  CategoryRankingsResponse,
  KpiCardsResponse,
  MotivationSummaryResponse,
  OrderStatusDistributionResponse,
  ProductRankingsResponse,
  RevenueChartResponse,
  RevenueRange,
} from "../types/dashboard.type";

export const getRevenueChartApi = async (range: RevenueRange): Promise<RevenueChartResponse> => {
  const response = await api.get<RevenueChartResponse>(`/analysis/revenue-chart?range=${range}`);
  return response.data;
};

export const getKpiCardsApi = async (): Promise<KpiCardsResponse> => {
  const response = await api.get<KpiCardsResponse>("/analysis/kpis");
  return response.data;
};

export const getOrderStatusDistributionApi = async (): Promise<OrderStatusDistributionResponse> => {
  const response = await api.get<OrderStatusDistributionResponse>("/analysis/order-status");
  return response.data;
};

export const getProductRankingsApi = async (): Promise<ProductRankingsResponse> => {
  const response = await api.get<ProductRankingsResponse>("/analysis/product-rankings");
  return response.data;
};

export const getCategoryRankingsApi = async (): Promise<CategoryRankingsResponse> => {
  const response = await api.get<CategoryRankingsResponse>("/analysis/category-rankings");
  return response.data;
};

export const getMotivationSummaryApi = async (): Promise<MotivationSummaryResponse> => {
  const response = await api.get<MotivationSummaryResponse>("/analysis/motivation");
  return response.data;
};
