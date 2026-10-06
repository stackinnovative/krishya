import api from "@/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type {
  AdminGetAllBannerResponse,
  AdminGetAllHeroResponse,
  AdminGetAllTestimonialResponse,
  CreateBannerPayload,
  CreateHeroPayload,
  CreateTestimonialPayload,
} from "../types/home-content.type";

// ---------- Storefront (public) ----------
export const getHeroUserApi = () => api.get<AdminGetAllHeroResponse>("/heroes/list").then((r) => r.data);
export const getBannerUserApi = () => api.get<AdminGetAllBannerResponse>("/banners/list").then((r) => r.data);
export const getTestimonialUserApi = () => api.get<AdminGetAllTestimonialResponse>("/testimonials/list").then((r) => r.data);

// ---------- Hero ----------
export const createHeroApi = (data: CreateHeroPayload) => api.post<ApiResponse>("/heroes", data).then((r) => r.data);
export const editHeroApi = (id: string, data: CreateHeroPayload) => api.put<ApiResponse>(`/heroes/${id}`, data).then((r) => r.data);
export const blockHeroApi = (id: string) => api.patch<ApiResponse>(`/heroes/${id}/block`).then((r) => r.data);
export const unblockHeroApi = (id: string) => api.patch<ApiResponse>(`/heroes/${id}/unblock`).then((r) => r.data);
export const getAllHeroForAdminApi = () => api.get<AdminGetAllHeroResponse>("/heroes").then((r) => r.data);

// ---------- Banner ----------
export const createBannerApi = (data: CreateBannerPayload) => api.post<ApiResponse>("/banners", data).then((r) => r.data);
export const editBannerApi = (id: string, data: CreateBannerPayload) => api.put<ApiResponse>(`/banners/${id}`, data).then((r) => r.data);
export const blockBannerApi = (id: string) => api.patch<ApiResponse>(`/banners/${id}/block`).then((r) => r.data);
export const unblockBannerApi = (id: string) => api.patch<ApiResponse>(`/banners/${id}/unblock`).then((r) => r.data);
export const getAllBannerForAdminApi = () => api.get<AdminGetAllBannerResponse>("/banners").then((r) => r.data);
export const deleteBannerApi = (id: string) => api.delete<ApiResponse>(`/banners/${id}`).then((r) => r.data);

// ---------- Testimonial ----------
export const createTestimonialApi = (data: CreateTestimonialPayload) => api.post<ApiResponse>("/testimonials", data).then((r) => r.data);
export const editTestimonialApi = (id: string, data: CreateTestimonialPayload) =>
  api.put<ApiResponse>(`/testimonials/${id}`, data).then((r) => r.data);
export const blockTestimonialApi = (id: string) => api.patch<ApiResponse>(`/testimonials/${id}/block`).then((r) => r.data);
export const unblockTestimonialApi = (id: string) => api.patch<ApiResponse>(`/testimonials/${id}/unblock`).then((r) => r.data);
export const getAllTestimonialForAdminApi = () => api.get<AdminGetAllTestimonialResponse>("/testimonials").then((r) => r.data);
export const deleteTestimonialApi = (id: string) => api.delete<ApiResponse>(`/testimonials/${id}`).then((r) => r.data);
