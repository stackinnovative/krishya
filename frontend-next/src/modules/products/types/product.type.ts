import type { ApiResponse, GetAllDocResponse } from "@/shared/types/api.types";

export type AdminProductImage = { url: string; publicId: string };

export type IVariant = { size: string; stock: number; price: number; isDefault?: boolean };

export type AdminVariantItem = IVariant & {
  id: string;
  isActive: boolean;
  colorOptionId?: string;
  colorName?: string;
};

export type AddVariantPayload = Omit<AdminVariantItem, "id" | "isActive" | "colorName"> & { colorOptionId: string };
export type UpdateVariantPayload = Omit<AdminVariantItem, "id" | "colorOptionId" | "colorName">;

export type AdminColorOptionSummary = {
  id: string;
  colorName?: string;
  hex?: string;
  images: AdminProductImage[];
};

export type AddColorOptionPayload = {
  colorName?: string;
  hex?: string;
  images: AdminProductImage[];
  variants: { size: string; price: number; stock: number; isDefault?: boolean }[];
};

export type EditColorOptionPayload = { colorName?: string; hex?: string; images?: AdminProductImage[] };

export type CreateProductPayload = {
  name: string;
  description: string;
  categoryId: string;
  isFeatured: boolean;
  colorOptions: { colorName: string; hex?: string; images: AdminProductImage[]; variants: IVariant[] }[];
};

export type UpdateProductPayload = Omit<CreateProductPayload, "colorOptions">;

export type ProductDetails = {
  id: string;
  name: string;
  description: string;
  category: { id: string; name: string };
  variants: AdminVariantItem[];
  colorOptions: AdminColorOptionSummary[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
};

export type ProductListItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: { id: string; name: string };
  description: string;
  isActive: boolean;
  isFeatured: boolean;
};

export type GetProductListResponse = GetAllDocResponse<ProductListItem[]>;
export type GetProductDetailsResponse = ApiResponse<ProductDetails>;
export type VariantResponse = ApiResponse<AdminVariantItem>;
