import type { ApiResponse, GetAllDocResponse } from "@/shared/types/api.types";
import type { ProductType, VariantUnit } from "../constants/product-options";

export type AdminProductImage = { url: string; publicId: string };

export type ProductIngredient = { name: string; botanicalName?: string };

/** What admin sends for one quantity option. `discountPercent` is never sent - the backend works it out from mrp and price. */
export type VariantPayload = {
  quantity: number;
  unit: VariantUnit;
  mrp: number;
  price: number;
  stock: number;
  isActive: boolean;
  isDefault: boolean;
};

export type AdminVariantItem = Omit<VariantPayload, "isDefault"> & {
  variantId: string;
  discountPercent: number;
  isDefault: boolean;
};

/** Everything on the product form except variants - what the edit endpoint takes. */
export type UpdateProductPayload = {
  name: string;
  categoryId: string;
  type: ProductType;
  shortDescription: string;
  description: string;
  ingredients: ProductIngredient[];
  howToUse: string;
  storage: string;
  badge: string;
  images: AdminProductImage[];
  isFeatured: boolean;
};

export type CreateProductPayload = UpdateProductPayload & { variants: VariantPayload[] };

export type ProductDetails = Omit<UpdateProductPayload, "categoryId"> & {
  id: string;
  slug: string;
  category: { id: string; name: string };
  variants: AdminVariantItem[];
  defaultVariantId: string | null;
  isActive: boolean;
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  price: number;
  mrp: number;
  discountPercent: number;
  image?: string;
  category: { id: string; name: string };
  shortDescription: string;
  isActive: boolean;
  isFeatured: boolean;
};

export type GetProductListResponse = GetAllDocResponse<ProductListItem[]>;
export type GetProductDetailsResponse = ApiResponse<ProductDetails>;
export type VariantResponse = ApiResponse<AdminVariantItem>;
