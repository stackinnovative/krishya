import api from "@/lib/api-client";
import type { GetSettingsResponse, UpdateSettingsPayload, UpdateSettingsResponse } from "../types/settings.type";

export const getSettingsApi = async (): Promise<GetSettingsResponse> => {
  const response = await api.get<GetSettingsResponse>("/settings");
  return response.data;
};

export const updateSettingsApi = async (payload: UpdateSettingsPayload): Promise<UpdateSettingsResponse> => {
  const response = await api.put<UpdateSettingsResponse>("/settings", payload);
  return response.data;
};
