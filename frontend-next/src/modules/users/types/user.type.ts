import type { ApiResponse, GetAllDocResponse } from "@/shared/types/api.types";

export interface AdminUserAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: AdminUserAddress;
  role: "admin" | "user";
  isBlocked: boolean;
  createdAt: string;
}

export type AdminUserListResponse = GetAllDocResponse<AdminUserListItem[]>;
export type AdminUserDetailResponse = ApiResponse<AdminUserListItem>;

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "admin" | "user";
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
  /** Leave blank to keep the current password. */
  password?: string;
}
