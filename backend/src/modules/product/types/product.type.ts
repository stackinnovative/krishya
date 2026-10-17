import { Types, type ClientSession } from "mongoose";
import type { IdName } from "../../../core/shared/types/id.name.type.js";

/** The form a preparation comes in - the second shop filter next to category. Labels live on the frontend. */
export const PRODUCT_TYPES = ["thailam", "churnam", "arishtam", "gulika", "keram", "face-pack"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

/** What a variant's quantity is counted in: 200 ml, 100 g, 60 tablets. */
export const VARIANT_UNITS = ["ml", "g", "tablets", "capsules"] as const;
export type VariantUnit = (typeof VARIANT_UNITS)[number];

export const PRODUCT_LIMITS = {
  nameMin: 2,
  name: 150,
  slug: 160,
  shortDescription: 160,
  descriptionMin: 10,
  description: 1000,
  howToUse: 1000,
  storage: 500,
  badge: 20,
  ingredients: 20,
  ingredientName: 60,
  botanicalName: 80,
  imagesMax: 5,
  variantsMax: 10,
  quantityMax: 100000,
} as const;

export interface IImage {
  url: string;
  publicId: string;
}
export type UserImage = Pick<IImage, "url">;

export interface IIngredient {
  name: string;
  botanicalName?: string | undefined;
}

/* ---------- persistence ---------- */

export interface IVariant {
  _id: Types.ObjectId;
  quantity: number;
  unit: VariantUnit;
  mrp: number;
  price: number;
  /** Set by the backend from mrp/price on every write, never sent by admin. */
  discountPercent: number;
  stock: number;
  isActive: boolean;
}

/* ---------- write inputs ---------- */

export type AddVariantProps = {
  quantity: number;
  unit: VariantUnit;
  mrp: number;
  price: number;
  stock: number;
  isActive: boolean;
  isDefault: boolean;
};

export type EditVariantProps = AddVariantProps;

export type UpdateVariantParams = {
  productId: string;
  variantId: string;
  data: EditVariantProps;
};

export type StockUpdateProps = {
  productId: string;
  variantId: string;
  quantity: number;
  session?: ClientSession;
};

/* ---------- views ---------- */

export type AdminVariantView = {
  variantId: string;
  quantity: number;
  unit: VariantUnit;
  mrp: number;
  price: number;
  discountPercent: number;
  stock: number;
  isActive: boolean;
  isDefault: boolean;
};

export type UserVariantView = Omit<AdminVariantView, "isActive" | "isDefault">;

type ProductContent = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  shortDescription: string;
  description: string;
  ingredients: IIngredient[];
  howToUse: string;
  storage: string;
  badge: string;
  defaultVariantId: string | null;
};

export type ProductView = ProductContent & {
  category: IdName;
  images: IImage[];
  variants: AdminVariantView[];
  isActive: boolean;
  isFeatured: boolean;
};

export type UserProductView = ProductContent & {
  category: IdName & { slug: string };
  images: UserImage[];
  /** Active variants only. */
  variants: UserVariantView[];
};

/** A product card: the default variant's price trio plus enough to add it to the bag. */
export type UserProductListView = {
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

export type ProductListView = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  price: number;
  mrp: number;
  discountPercent: number;
  image?: string | undefined;
  category: IdName;
  isActive: boolean;
  shortDescription: string;
  isFeatured: boolean;
};

export type PaginatedUserProductList = {
  data: UserProductListView[];
  nextPage: number | null;
  hasMore: boolean;
};
