import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getAllProductsForUserApi, getFeaturedProductsApi, getProductByIdForUserApi } from "@/modules/products/api/storefront-product.api";
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

  // Hero slides, then the product each one spotlights - so the slideshow and
  // its product cards are in the first HTML instead of popping in after load.
  const prefetchHeroes = async () => {
    await queryClient.prefetchQuery({ queryKey: homeContentKeys.heroUser, queryFn: getHeroUserApi });
    const heroes = queryClient.getQueryData<Awaited<ReturnType<typeof getHeroUserApi>>>(homeContentKeys.heroUser)?.data ?? [];
    const spotlightIds = [...new Set(heroes.map((h) => h.spotlightProductId).filter((id): id is string => Boolean(id)))];
    await Promise.all(
      spotlightIds.map((id) => queryClient.prefetchQuery({ queryKey: [...productKeys.userDetails, id], queryFn: () => getProductByIdForUserApi(id) })),
    );
  };

  await Promise.all([
    prefetchHeroes(),
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
