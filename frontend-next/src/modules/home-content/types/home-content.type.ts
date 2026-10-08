import type { ApiResponse } from "@/shared/types/api.types";

export type IImage = { url: string; publicId: string };

export type HeroView = {
  id: string;
  label?: string;
  title: string;
  subtitle: string;
  image: IImage;
  isActive: boolean;
  priority?: number;
  buttonLabel?: string;
  buttonUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  badgeText?: string;
  spotlightProductId?: string;
  spotlightLabel?: string;
};

export type CreateHeroPayload = {
  label?: string;
  title: string;
  subtitle: string;
  image: IImage;
  buttonLabel?: string;
  buttonUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  badgeText?: string;
  spotlightProductId?: string;
  spotlightLabel?: string;
  priority?: number;
};

export type BannerView = { id: string; image: IImage; buttonUrl?: string; isActive: boolean };
export type CreateBannerPayload = { image: IImage; buttonUrl?: string };

export type TestimonialView = { id: string; comment: string; author: string; isActive: boolean };
export type CreateTestimonialPayload = { comment: string; author: string };

export type AdminGetAllHeroResponse = ApiResponse<HeroView[]>;
export type AdminGetAllBannerResponse = ApiResponse<BannerView[]>;
export type AdminGetAllTestimonialResponse = ApiResponse<TestimonialView[]>;
