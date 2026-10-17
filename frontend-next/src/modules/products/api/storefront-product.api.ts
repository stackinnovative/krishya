import api from "@/lib/api-client";
import type {
  CategoryProductCollectionResponse,
  UserFeaturedProductListResponse,
  UserProductDetailsResponse,
  UserProductListResponse,
  UserProductVariantResponse,
} from "../types/storefront-product.type";

export const getFeaturedProductsApi = (): Promise<UserFeaturedProductListResponse> =>
  api.get<UserFeaturedProductListResponse>("/products/featured").then((r) => r.data);

export const getToteBagCollectionApi = (): Promise<CategoryProductCollectionResponse> =>
  api.get<CategoryProductCollectionResponse>("/products/tote-bag-collection").then((r) => r.data);

export const getAllProductsForUserApi = (query: Record<string, unknown>): Promise<UserProductListResponse> =>
  api.get<UserProductListResponse>("/products/list", { params: query }).then((r) => r.data);

export const getProductByIdForUserApi = (id: string): Promise<UserProductDetailsResponse> =>
  api.get<UserProductDetailsResponse>(`/products/list/${id}`).then((r) => r.data);

/** The /products/<slug> page. */
export const getProductBySlugForUserApi = (slug: string): Promise<UserProductDetailsResponse> =>
  api.get<UserProductDetailsResponse>(`/products/slug/${encodeURIComponent(slug)}`).then((r) => r.data);

export const getRelatedProductsApi = (categoryId: string, excludeProductId?: string): Promise<UserProductListResponse> =>
  api
    .get<UserProductListResponse>(`/products/related/${categoryId}`, { params: excludeProductId ? { excludeProductId } : undefined })
    .then((r) => r.data);

export const getProductVariantForUserApi = (productId: string, variantId: string): Promise<UserProductVariantResponse> =>
  api.get<UserProductVariantResponse>(`/products/list/${productId}/variants/${variantId}`).then((r) => r.data);
