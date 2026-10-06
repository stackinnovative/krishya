import type { ApiResponse } from "@/shared/types/api.types";
import type { PolicyIconName } from "../constants/policy-icons";

export type SettingsLogo = {
  url: string;
  publicId: string;
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
};

export type UpdateSettingsPayload = Omit<SettingsView, "id">;

export type GetSettingsResponse = ApiResponse<SettingsView>;
export type UpdateSettingsResponse = ApiResponse<SettingsView>;
