import type { ApiResponse } from "@/shared/types/api.types";
import type { ProductType, VariantUnit } from "../constants/product-options";
import type { ProductIngredient } from "./product.type";

export type UserProductImage = { url: string };

/** One quantity on sale. `discountPercent` is stored by the backend - render it as-is, never recompute it here. */
export type UserVariantView = {
  variantId: string;
  quantity: number;
  unit: VariantUnit;
  mrp: number;
  price: number;
  discountPercent: number;
  stock: number;
};

export type UserProductDetails = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  category: { id: string; name: string; slug: string };
  shortDescription: string;
  description: string;
  ingredients: ProductIngredient[];
  howToUse: string;
  storage: string;
  badge: string;
  images: UserProductImage[];
  variants: UserVariantView[];
  defaultVariantId: string | null;
};

/** A product card: the default quantity's price, MRP and discount. */
export type UserProductListItem = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  shortDescription: string;
  badge: string;
  image: string;
  defaultVariantId: string | null;
  price: number;
  mrp: number;
  discountPercent: number;
  variantCount: number;
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
