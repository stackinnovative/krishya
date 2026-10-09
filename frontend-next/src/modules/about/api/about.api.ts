import api from "@/lib/api-client";
import type { GetAboutResponse, UpdateAboutPayload, UpdateAboutResponse } from "../types/about.type";

export const getAboutApi = async (): Promise<GetAboutResponse> => {
  const response = await api.get<GetAboutResponse>("/about");
  return response.data;
};

export const updateAboutApi = async (payload: UpdateAboutPayload): Promise<UpdateAboutResponse> => {
  const response = await api.put<UpdateAboutResponse>("/about", payload);
  return response.data;
};
