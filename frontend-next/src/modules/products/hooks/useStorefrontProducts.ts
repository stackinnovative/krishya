import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getAllProductsForUserApi,
  getFeaturedProductsApi,
  getProductByIdForUserApi,
  getRelatedProductsApi,
  getToteBagCollectionApi,
} from "../api/storefront-product.api";
import { productKeys } from "@/shared/query-keys";
import { formatCurrency } from "@/lib/format";

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

/** Live (active) products as dropdown options - e.g. the hero "spotlight product" picker.
 * Only active products are listed, so admin can't spotlight something customers can't buy.
 * 100 is the backend's per-request cap. */
export const useActiveProductOptions = () =>
  useQuery({
    queryKey: [...productKeys.userList, "options"],
    queryFn: () => getAllProductsForUserApi({ search: "", sort: "newest", limit: 100, page: 1 }),
    select: (res) => res.data.map((p) => ({ label: `${p.name} - ${formatCurrency(p.price)}`, value: p.id })),
    staleTime: 60_000,
  });

export const useProductDetails = (id: string) =>
  useQuery({ queryKey: [...productKeys.userDetails, id], queryFn: () => getProductByIdForUserApi(id), enabled: !!id });

export const useRelatedProducts = (categoryId: string, excludeProductId?: string) =>
  useQuery({
    queryKey: [...productKeys.related, categoryId, excludeProductId],
    queryFn: () => getRelatedProductsApi(categoryId, excludeProductId),
    enabled: !!categoryId,
  });
