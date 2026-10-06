import type { ApiResponse } from "@/shared/types/api.types";
import type { IVariant } from "./product.type";

export type UserProductImage = { url: string };

export type UserColorOptionSummary = { id: string; colorName?: string; hex?: string; images: UserProductImage[] };

export type UserVariantView = IVariant & { variantId: string; colorOptionId?: string; colorName?: string };

export type UserProductDetails = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  variants: UserVariantView[];
  colorOptions: UserColorOptionSummary[];
};

export type UserProductListItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export type UserProductDetailsResponse = ApiResponse<UserProductDetails>;
export type UserProductVariantResponse = ApiResponse<UserVariantView>;
export type UserFeaturedProductListResponse = ApiResponse<UserProductListItem[]>;

export type CategoryProductCollection = { categoryId: string | null; products: UserProductListItem[] };
export type CategoryProductCollectionResponse = ApiResponse<CategoryProductCollection>;

export type UserProductListResponse = {
  success: boolean;
  message: string;
  data: UserProductListItem[];
  nextPage: number | null;
  hasMore: boolean;
};
