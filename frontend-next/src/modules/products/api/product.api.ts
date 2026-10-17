import api from "@/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type {
  CreateProductPayload,
  GetProductDetailsResponse,
  GetProductListResponse,
  UpdateProductPayload,
  VariantPayload,
  VariantResponse,
} from "../types/product.type";

export const createProductApi = async (data: CreateProductPayload): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/products", data);
  return response.data;
};

export const editProductApi = async (id: string, data: UpdateProductPayload): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(`/products/${id}`, data);
  return response.data;
};

export const blockProductApi = async (id: string): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/products/${id}/block`);
  return response.data;
};

export const unblockProductApi = async (id: string): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/products/${id}/unblock`);
  return response.data;
};

export const getAllProductsForAdminApi = async (query: Record<string, unknown>): Promise<GetProductListResponse> => {
  const response = await api.get<GetProductListResponse>("/products", { params: query });
  return response.data;
};

export const getProductByIdForAdminApi = async (id: string): Promise<GetProductDetailsResponse> => {
  const response = await api.get<GetProductDetailsResponse>(`/products/${id}`);
  return response.data;
};

export const addVariantApi = async (productId: string, data: VariantPayload[]): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>(`/products/${productId}/variants`, data);
  return response.data;
};

export const updateVariantApi = async (
  productId: string,
  variantId: string,
  data: VariantPayload
): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(`/products/${productId}/variants/${variantId}`, data);
  return response.data;
};

export const getProductVariantForAdminApi = async (productId: string, variantId: string): Promise<VariantResponse> => {
  const response = await api.get<VariantResponse>(`/products/${productId}/variants/${variantId}`);
  return response.data;
};
