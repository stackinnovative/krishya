import type { ApiResponse, GetAllDocResponse } from "@/shared/types/api.types";
import type { BLOG_CATEGORIES } from "../constants";

export type BlogImage = { url: string; publicId: string };

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
export type BlogStatus = "draft" | "published";

/** Article body block, as stored and as the editor sends it. */
export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "image"; image: BlogImage; caption: string }
  | { type: "products"; productIds: string[] };

export type BlogBlockType = BlogBlock["type"];

export type BlogProduct = { id: string; name: string; price: number; image: string };

/** A block as the storefront renders it - product ids already resolved to live products. */
export type UserBlogBlock = Exclude<BlogBlock, { type: "products" }> | { type: "products"; products: BlogProduct[] };

/** Article card (Journal index, home page, related articles). */
export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  category: BlogCategory;
  excerpt: string;
  coverImage: BlogImage | null;
  readMinutes: number;
  isFeatured: boolean;
  publishedAt: string | null;
};

export type AdminBlogListItem = BlogListItem & { status: BlogStatus; updatedAt: string | null };

export type AdminBlog = AdminBlogListItem & {
  blocks: BlogBlock[];
  seoTitle: string;
  seoDescription: string;
  products: BlogProduct[];
};

export type UserBlog = BlogListItem & {
  blocks: UserBlogBlock[];
  seoTitle: string;
  seoDescription: string;
  related: BlogListItem[];
};

export type SaveBlogPayload = {
  title: string;
  slug: string;
  category: BlogCategory;
  excerpt: string;
  coverImage: BlogImage | null;
  blocks: BlogBlock[];
  isFeatured: boolean;
  status: BlogStatus;
  /** ISO date, or null to clear it (a published article then keeps/gets "now"). */
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
};

export type GetAdminBlogListResponse = GetAllDocResponse<AdminBlogListItem[]>;
export type GetAdminBlogResponse = ApiResponse<AdminBlog>;
export type SaveBlogResponse = ApiResponse<AdminBlog>;
export type GetBlogListResponse = GetAllDocResponse<BlogListItem[]>;
export type GetFeaturedBlogResponse = ApiResponse<BlogListItem | null>;
export type GetUserBlogResponse = ApiResponse<UserBlog>;
