import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getActiveCategoriesApi } from "@/modules/categories/api/category.api";
import { getAllProductsForUserApi } from "@/modules/products/api/storefront-product.api";
import { categoryKeys, productKeys } from "@/shared/query-keys";
import ProductsPageContent from "./ProductsPageContent";

export const metadata: Metadata = {
  title: "Shop",
  description: "Classical Kerala Ayurveda preparations - thailams, churnams, arishtams and hair oils - chosen by health need.",
};

type Search = { searchParams: Promise<{ categoryId?: string; search?: string; sort?: string }> };

// Server-rendered so the first page of products (and active categories) is
// present in the initial HTML for crawlers - filters/sort/search/infinite
// scroll beyond that stay fully client-driven, unchanged, in
// ProductsPageContent.
export default async function ProductsPage({ searchParams }: Search) {
  const { categoryId, search = "", sort = "newest" } = await searchParams;
  // Must mirror the client's useProductList filters so the hydrated cache is hit.
  const filters = { search, sort, categoryId };

  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: categoryKeys.active, queryFn: getActiveCategoriesApi }),
    queryClient.prefetchInfiniteQuery({
      queryKey: [...productKeys.userList, filters],
      queryFn: ({ pageParam }: { pageParam: number }) => getAllProductsForUserApi({ ...filters, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (last: { nextPage: number | null }) => last.nextPage,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsPageContent />
    </HydrationBoundary>
  );
}
