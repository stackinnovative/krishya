import { isAxiosError } from "axios";
import api from "@/lib/api-client";
import { raw } from "@/lib/raw-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type { AuthUser, LoginPayload, LoginResponse } from "../types/auth.type";

export const loginApi = async ({
  data,
  role,
}: {
  data: LoginPayload;
  role: "user" | "admin";
}): Promise<LoginResponse> => {
  const point = role === "user" ? "auth" : "admin";
  const response = await api.post<LoginResponse>(`/${point}/login`, data);
  return response.data;
};

/** On a page reload the access cookie may already have expired while the refresh one is still valid - refresh once before giving up on the session. */
export const getCurrentUserApi = async (): Promise<AuthUser | null> => {
  try {
    const response = await raw.post<LoginResponse>("/auth/me");
    return response.data.data?.user ?? null;
  } catch (err) {
    if (!isAxiosError(err) || err.response?.status !== 401) throw err;
    await raw.post("/auth/refresh");
    const response = await raw.post<LoginResponse>("/auth/me");
    return response.data.data?.user ?? null;
  }
};

export const logoutUserApi = async (): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/logout");
  return response.data;
};
