import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as api from "../api/home-content.api";
import { getApiErrorMessage } from "@/lib/errors";
import type { CreateBannerPayload, CreateHeroPayload, CreateTestimonialPayload } from "../types/home-content.type";
import { homeContentKeys } from "@/shared/query-keys";

export const useAdminHeroes = () => useQuery({ queryKey: homeContentKeys.adminHeroes, queryFn: api.getAllHeroForAdminApi });
export const useAdminBanners = () => useQuery({ queryKey: homeContentKeys.adminBanners, queryFn: api.getAllBannerForAdminApi });
export const useAdminTestimonials = () => useQuery({ queryKey: homeContentKeys.adminTestimonials, queryFn: api.getAllTestimonialForAdminApi });

const invalidateHeroViews = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: homeContentKeys.adminHeroes });
  qc.invalidateQueries({ queryKey: homeContentKeys.heroUser });
};
const invalidateBannerViews = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: homeContentKeys.adminBanners });
  qc.invalidateQueries({ queryKey: homeContentKeys.bannerUser });
};
const invalidateTestimonialViews = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: homeContentKeys.adminTestimonials });
  qc.invalidateQueries({ queryKey: homeContentKeys.testimonialsUser });
};

export const useSaveHero = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: CreateHeroPayload }) => (id ? api.editHeroApi(id, data) : api.createHeroApi(data)),
    onSuccess: (_r, v) => { toast.success(v.id ? "Hero updated" : "Hero added"); invalidateHeroViews(qc); },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not save the hero slide.")),
  });
};
export const useToggleHero = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => (isActive ? api.blockHeroApi(id) : api.unblockHeroApi(id)),
    onSuccess: () => invalidateHeroViews(qc),
  });
};

export const useSaveBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: CreateBannerPayload }) => (id ? api.editBannerApi(id, data) : api.createBannerApi(data)),
    onSuccess: (_r, v) => { toast.success(v.id ? "Banner updated" : "Banner added"); invalidateBannerViews(qc); },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not save the banner.")),
  });
};
export const useToggleBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => (isActive ? api.blockBannerApi(id) : api.unblockBannerApi(id)),
    onSuccess: () => invalidateBannerViews(qc),
  });
};
export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteBannerApi(id),
    onSuccess: () => { toast.success("Banner deleted"); invalidateBannerViews(qc); },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not delete the banner.")),
  });
};

export const useSaveTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: CreateTestimonialPayload }) =>
      id ? api.editTestimonialApi(id, data) : api.createTestimonialApi(data),
    onSuccess: (_r, v) => { toast.success(v.id ? "Testimonial updated" : "Testimonial added"); invalidateTestimonialViews(qc); },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not save the testimonial.")),
  });
};
export const useToggleTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => (isActive ? api.blockTestimonialApi(id) : api.unblockTestimonialApi(id)),
    onSuccess: () => invalidateTestimonialViews(qc),
  });
};
export const useDeleteTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTestimonialApi(id),
    onSuccess: () => { toast.success("Testimonial deleted"); invalidateTestimonialViews(qc); },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not delete the testimonial.")),
  });
};
