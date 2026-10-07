import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getAllProductsForUserApi,
  getFeaturedProductsApi,
  getProductByIdForUserApi,
  getRelatedProductsApi,
  getToteBagCollectionApi,
} from "../api/storefront-product.api";
import { productKeys } from "@/shared/query-keys";

export const useFeaturedProducts = () => useQuery({ queryKey: productKeys.featured, queryFn: getFeaturedProductsApi });

export const useToteBagCollection = () => useQuery({ queryKey: productKeys.toteBagCollection, queryFn: getToteBagCollectionApi });

export const useProductList = (filters: Record<string, unknown>) =>
  useInfiniteQuery({
    queryKey: [...productKeys.userList, filters],
    queryFn: ({ pageParam }) => getAllProductsForUserApi({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage,
  });

/** Quick results for the header search overlay - the first page of the normal list endpoint, filtered by `search`. */
export const useProductSearch = (search: string, limit = 6) =>
  useQuery({
    queryKey: [...productKeys.userList, "quick-search", search, limit],
    queryFn: () => getAllProductsForUserApi({ search, limit, page: 1 }),
    enabled: search.length > 0,
    placeholderData: (prev) => prev,
  });

export const useProductDetails = (id: string) =>
  useQuery({ queryKey: [...productKeys.userDetails, id], queryFn: () => getProductByIdForUserApi(id), enabled: !!id });

export const useRelatedProducts = (categoryId: string, excludeProductId?: string) =>
  useQuery({
    queryKey: [...productKeys.related, categoryId, excludeProductId],
    queryFn: () => getRelatedProductsApi(categoryId, excludeProductId),
    enabled: !!categoryId,
  });
