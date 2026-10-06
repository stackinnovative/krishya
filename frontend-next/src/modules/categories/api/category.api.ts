import api from "@/lib/api-client";
import type { ApiResponse, GetIdNameResponse } from "@/shared/types/api.types";
import type { CreateCategoryPayload, GetCategoryListResponse } from "../types/category.type";
import type { GetSignatureCategoriesResponse } from "../types/storefront-category.type";

export const getSignatureCategoriesApi = async (): Promise<GetSignatureCategoriesResponse> => {
  const response = await api.get<GetSignatureCategoriesResponse>("/categories/signature");
  return response.data;
};

export const createCategoryApi = async (data: CreateCategoryPayload): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/categories", data);
  return response.data;
};

export const editCategoryApi = async (id: string, data: CreateCategoryPayload): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(`/categories/${id}`, data);
  return response.data;
};

export const blockCategoryApi = async (id: string): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/categories/${id}/block`);
  return response.data;
};

export const unblockCategoryApi = async (id: string): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/categories/${id}/unblock`);
  return response.data;
};

export const getAllCategoriesForAdminApi = async (query: Record<string, unknown>): Promise<GetCategoryListResponse> => {
  const response = await api.get<GetCategoryListResponse>("/categories", { params: query });
  return response.data;
};

/** Every active category, flat - what storefront nav/filter pills and any "pick a category" control should offer. */
export const getActiveCategoriesApi = async (): Promise<GetIdNameResponse> => {
  const response = await api.get<GetIdNameResponse>("/categories/list");
  return response.data;
};
