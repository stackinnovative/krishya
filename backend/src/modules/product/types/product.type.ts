import { Types, type ClientSession } from "mongoose";
import type { IdName } from "../../../core/shared/types/id.name.type.js";

export interface IVariant {
  _id: Types.ObjectId;
  size?: string | undefined;
  stock: number;
  price: number;
  isActive: boolean;
}

export interface IColorOption {
  _id: Types.ObjectId;
  colorName?: string | undefined;
  hex?: string | undefined;
  images?: IImage[] | undefined;
  variants: IVariant[];
}

export type AdminVariantView = {
  variantId: string;
  size?: string | undefined;
  stock: number;
  price: number;
  isActive: boolean;
  isDefault: boolean;
  colorOptionId?: string | undefined;
  colorName?: string | undefined;
};

export type AddVariantProps = Omit<AdminVariantView, "variantId" | "colorOptionId" | "colorName">;

export type UserVariantView = {
  variantId: string
  stock: number
  size?: string | undefined;
  price: number;
  colorOptionId?: string | undefined;
  colorName?: string | undefined;
};

export type AddColorOptionProps = {
  colorName?: string | undefined;
  hex?: string | undefined;
  images?: IImage[] | undefined;
  variants: AddVariantProps[];
};

export type EditColorOptionProps = {
  colorName?: string | undefined;
  hex?: string | undefined;
  images?: IImage[] | undefined;
};

export type EditVariantProps = {
  stock: number;
  price: number;
  isActive: boolean;
  isDefault?: boolean;
}

export type UpdateVariantParams = {
  productId: string;
  variantId: string;
  data: EditVariantProps;
};

export interface IImage {
  url: string;
  publicId: string;
}
export type UserImage = Pick<IImage, "url">;

export type AdminColorOptionSummary = {
  id: string;
  colorName?: string | undefined;
  hex?: string | undefined;
  images: IImage[];
};

export type UserColorOptionSummary = {
  id: string;
  colorName?: string | undefined;
  hex?: string | undefined;
  images: UserImage[];
};

export type UserProductView = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  variants: UserVariantView[];
  colorOptions: UserColorOptionSummary[];
};

export type ProductView = {
  id: string;
  name: string;
  description: string;
  category: IdName;
  variants: AdminVariantView[];
  colorOptions: AdminColorOptionSummary[];
  isActive: boolean;
  isFeatured: boolean;
};

export type UserProductListView = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export type ProductListView = {
  id: string;
  name: string;
  price: number;
  image?: string | undefined;
  category: IdName;
  isActive: boolean;
  description: string;
  isFeatured: boolean;
};

export type PaginatedUserProductList = {
  data: UserProductListView[];
  nextPage: number | null;
  hasMore: boolean;
};

export type StockUpdateProps = {
  productId: string;
  variantId: string;
  quantity: number;
  session?: ClientSession;
}
