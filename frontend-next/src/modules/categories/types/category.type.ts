import type { ApiResponse, GetAllDocResponse, GetIdNameResponse } from "@/shared/types/api.types";
import type { CategoryIconName } from "../constants/category-icons";

export type CreateCategoryPayload = {
  name: string;
  description: string;
  icon: CategoryIconName;
  sortOrder: number;
};

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: CategoryIconName;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type GetCategoryListResponse = GetAllDocResponse<CategoryListItem[]>;
export type GetCategoryDetailsResponse = ApiResponse<CategoryListItem>;
export type { GetIdNameResponse };
