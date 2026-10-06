import type { ApiResponse } from "@/shared/types/api.types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

export interface LoginData {
  user: AuthUser;
}

export type LoginResponse = ApiResponse<LoginData>;

export interface LoginPayload {
  email: string;
  password: string;
}
