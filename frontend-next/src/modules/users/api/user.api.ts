import api from "@/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type { AdminUserDetailResponse, AdminUserListResponse, CreateUserPayload, UpdateUserPayload } from "../types/user.type";

export const getAdminUserListApi = async (query: Record<string, unknown>): Promise<AdminUserListResponse> => {
  const response = await api.get<AdminUserListResponse>("/admin/users", { params: query });
  return response.data;
};

export const getAdminUserDetailApi = async (userId: string): Promise<AdminUserDetailResponse> => {
  const response = await api.get<AdminUserDetailResponse>(`/admin/users/${userId}`);
  return response.data;
};

export const createAdminUserApi = async (data: CreateUserPayload): Promise<AdminUserDetailResponse> => {
  const response = await api.post<AdminUserDetailResponse>("/admin/users", data);
  return response.data;
};

export const updateAdminUserApi = async (userId: string, data: UpdateUserPayload): Promise<AdminUserDetailResponse> => {
  const response = await api.put<AdminUserDetailResponse>(`/admin/users/${userId}`, data);
  return response.data;
};

export const blockAdminUserApi = async (userId: string): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/admin/users/${userId}/block`);
  return response.data;
};

export const unblockAdminUserApi = async (userId: string): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/admin/users/${userId}/unblock`);
  return response.data;
};
