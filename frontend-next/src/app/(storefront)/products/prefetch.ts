import type { QueryClient } from "@tanstack/react-query";
import { getActiveCategoriesApi } from "@/modules/categories/api/category.api";
import { getAllProductsForUserApi } from "@/modules/products/api/storefront-product.api";
import { isProductType, type ProductType } from "@/modules/products/constants/product-options";
import { categoryKeys, productKeys } from "@/shared/query-keys";

export type ShopFilters = { search: string; sort: string; categoryId?: string; type?: ProductType };

export const toProductType = (v: string | undefined): ProductType | undefined => (isProductType(v) ? v : undefined);

/**
 * Server prefetch shared by /products and /shop/<slug>: active categories
 * plus the first page of the list. `filters` must mirror what
 * ProductsPageContent passes to useProductList, so the hydrated cache is hit.
 */
export const prefetchShopPage = (queryClient: QueryClient, filters: ShopFilters) =>
  Promise.all([
    queryClient.prefetchQuery({ queryKey: categoryKeys.active, queryFn: getActiveCategoriesApi }),
    queryClient.prefetchInfiniteQuery({
      queryKey: [...productKeys.userList, filters],
      queryFn: ({ pageParam }: { pageParam: number }) => getAllProductsForUserApi({ ...filters, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (last: { nextPage: number | null }) => last.nextPage,
    }),
  ]);
