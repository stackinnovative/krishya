import api from "@/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type {
  GetAdminBlogListResponse,
  GetAdminBlogResponse,
  GetBlogListResponse,
  GetFeaturedBlogResponse,
  GetUserBlogResponse,
  SaveBlogPayload,
  SaveBlogResponse,
} from "../types/blog.type";

/* ---------- admin ---------- */

export const getAdminBlogsApi = async (query: Record<string, unknown>): Promise<GetAdminBlogListResponse> => {
  const response = await api.get<GetAdminBlogListResponse>("/blogs", { params: query });
  return response.data;
};

export const getAdminBlogApi = async (id: string): Promise<GetAdminBlogResponse> => {
  const response = await api.get<GetAdminBlogResponse>(`/blogs/${id}`);
  return response.data;
};

export const createBlogApi = async (data: SaveBlogPayload): Promise<SaveBlogResponse> => {
  const response = await api.post<SaveBlogResponse>("/blogs", data);
  return response.data;
};

export const editBlogApi = async (id: string, data: SaveBlogPayload): Promise<SaveBlogResponse> => {
  const response = await api.put<SaveBlogResponse>(`/blogs/${id}`, data);
  return response.data;
};

export const deleteBlogApi = async (id: string): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`/blogs/${id}`);
  return response.data;
};

export const publishBlogApi = async (id: string): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/blogs/${id}/publish`);
  return response.data;
};

export const unpublishBlogApi = async (id: string): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/blogs/${id}/unpublish`);
  return response.data;
};

/* ---------- storefront ---------- */

export const getBlogListApi = async (query: Record<string, unknown>): Promise<GetBlogListResponse> => {
  const response = await api.get<GetBlogListResponse>("/blogs/list", { params: query });
  return response.data;
};

export const getFeaturedBlogApi = async (): Promise<GetFeaturedBlogResponse> => {
  const response = await api.get<GetFeaturedBlogResponse>("/blogs/featured");
  return response.data;
};

export const getBlogBySlugApi = async (slug: string): Promise<GetUserBlogResponse> => {
  const response = await api.get<GetUserBlogResponse>(`/blogs/slug/${encodeURIComponent(slug)}`);
  return response.data;
};
