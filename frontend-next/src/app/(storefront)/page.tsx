import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getAllProductsForUserApi, getFeaturedProductsApi } from "@/modules/products/api/storefront-product.api";
import { getHeroUserApi, getTestimonialUserApi } from "@/modules/home-content/api/home-content.api";
import { getActiveCategoriesApi, getSignatureCategoriesApi } from "@/modules/categories/api/category.api";
import { categoryKeys, homeContentKeys, productKeys } from "@/shared/query-keys";
import HomeContent from "./HomeContent";

// Server-rendered so the homepage's real content (featured products,
// categories, promo copy) is present in the initial HTML for search engines
// and AI crawlers that don't execute JavaScript - previously this whole page
// was a client component that fetched everything after hydration, so a
// non-JS crawler saw an empty shell.
export default async function LandingPage() {
  const queryClient = new QueryClient();
  const newestFilters = { search: "", sort: "newest" };

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: homeContentKeys.heroUser, queryFn: getHeroUserApi }),
    queryClient.prefetchQuery({ queryKey: productKeys.featured, queryFn: getFeaturedProductsApi }),
    queryClient.prefetchQuery({ queryKey: categoryKeys.active, queryFn: getActiveCategoriesApi }),
    queryClient.prefetchQuery({ queryKey: categoryKeys.signature, queryFn: getSignatureCategoriesApi }),
    queryClient.prefetchQuery({ queryKey: homeContentKeys.testimonialsUser, queryFn: getTestimonialUserApi }),
    queryClient.prefetchInfiniteQuery({
      queryKey: [...productKeys.userList, newestFilters],
      queryFn: ({ pageParam }: { pageParam: number }) => getAllProductsForUserApi({ ...newestFilters, page: pageParam }),
      initialPageParam: 1,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeContent />
    </HydrationBoundary>
  );
}
