import type { ApiResponse } from "@/shared/types/api.types";
import type { PolicyIconName } from "../constants/policy-icons";
import type { SocialIconName } from "../constants/social-icons";

export type SettingsLogo = {
  url: string;
  publicId: string;
};

export type SocialLink = {
  icon: SocialIconName;
  label: string;
  url: string;
};

export type PolicySection = {
  heading: string;
  icon: PolicyIconName;
  description: string;
};

export type SettingsView = {
  id: string;
  storeName: string;
  email: string;
  phone: string;
  logo: SettingsLogo | null;
  deliveryCharge: number;
  freeAbove: number;
  cod: boolean;
  maintenance: boolean;
  refundReturnSections: PolicySection[];
  privacyPolicySections: PolicySection[];
  socialLinks: SocialLink[];
};

export type UpdateSettingsPayload = Omit<SettingsView, "id">;

export type GetSettingsResponse = ApiResponse<SettingsView>;
export type UpdateSettingsResponse = ApiResponse<SettingsView>;
