import type { ApiResponse, GetAllDocResponse, GetIdNameResponse } from "@/shared/types/api.types";

export type CreateCategoryPayload = {
  name: string;
  description: string;
};

export type CategoryListItem = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
};

export type GetCategoryListResponse = GetAllDocResponse<CategoryListItem[]>;
export type GetCategoryDetailsResponse = ApiResponse<CategoryListItem>;
export type { GetIdNameResponse };
