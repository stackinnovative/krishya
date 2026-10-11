import api from "@/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type { GetAdminFaqsResponse, GetHomeFaqsResponse, GetUserFaqsResponse, SaveFaqGroupPayload, SaveFaqPayload } from "../types/faq.type";

/* ---------- admin ---------- */

export const getAdminFaqsApi = async (): Promise<GetAdminFaqsResponse> => {
  const response = await api.get<GetAdminFaqsResponse>("/faqs");
  return response.data;
};

export const createFaqGroupApi = async (data: SaveFaqGroupPayload): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/faqs/groups", data);
  return response.data;
};

export const editFaqGroupApi = async (id: string, data: SaveFaqGroupPayload): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(`/faqs/groups/${id}`, data);
  return response.data;
};

export const deleteFaqGroupApi = async (id: string): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`/faqs/groups/${id}`);
  return response.data;
};

export const reorderFaqGroupsApi = async (ids: string[]): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>("/faqs/groups/reorder", { ids });
  return response.data;
};

export const createFaqApi = async (data: SaveFaqPayload): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/faqs", data);
  return response.data;
};

export const editFaqApi = async (id: string, data: SaveFaqPayload): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(`/faqs/${id}`, data);
  return response.data;
};

export const deleteFaqApi = async (id: string): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`/faqs/${id}`);
  return response.data;
};

export const reorderFaqsApi = async (groupId: string, ids: string[]): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/faqs/groups/${groupId}/reorder`, { ids });
  return response.data;
};

/* ---------- storefront ---------- */

export const getFaqListApi = async (): Promise<GetUserFaqsResponse> => {
  const response = await api.get<GetUserFaqsResponse>("/faqs/list");
  return response.data;
};

export const getHomeFaqsApi = async (): Promise<GetHomeFaqsResponse> => {
  const response = await api.get<GetHomeFaqsResponse>("/faqs/home");
  return response.data;
};
