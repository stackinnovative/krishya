import type { ApiResponse } from "@/shared/types/api.types";

export type FaqItem = {
  id: string;
  question: string;
  /** May contain {delivery}, {deliveryCharge}, {freeAbove} - see fillFaqAnswer. */
  answer: string;
  groupId: string;
  order: number;
  isActive: boolean;
  showOnHome: boolean;
};

/** Admin: every group (hidden ones too) with all its questions, in order. */
export type AdminFaqGroup = {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  faqs: FaqItem[];
};

export type UserFaq = { id: string; question: string; answer: string };

/** FAQ page: visible groups with their visible questions. */
export type UserFaqGroup = { id: string; name: string; faqs: UserFaq[] };

export type SaveFaqGroupPayload = { name: string; isActive: boolean };
export type SaveFaqPayload = { question: string; answer: string; groupId: string; isActive: boolean; showOnHome: boolean };

export type GetAdminFaqsResponse = ApiResponse<AdminFaqGroup[]>;
export type GetUserFaqsResponse = ApiResponse<UserFaqGroup[]>;
export type GetHomeFaqsResponse = ApiResponse<UserFaq[]>;
