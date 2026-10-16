import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getActiveCategories } from "@/modules/categories/server";
import ProductsPageContent from "./ProductsPageContent";
import { prefetchShopPage, toProductType } from "./prefetch";

export const metadata: Metadata = {
  title: "Shop",
  description: "Classical Kerala Ayurveda preparations - thailams, churnams, arishtams and hair oils - chosen by health need.",
};

type Search = { searchParams: Promise<{ categoryId?: string; type?: string; search?: string; sort?: string }> };

// Server-rendered so the first page of products (and active categories) is
// present in the initial HTML for crawlers - filters/sort/search/infinite
// scroll beyond that stay client-driven in ProductsPageContent.
export default async function ProductsPage({ searchParams }: Search) {
  const { categoryId, type, search = "", sort = "newest" } = await searchParams;

  // Old ?categoryId= links (shared or indexed before categories got their
  // own pages) move permanently to /shop/<slug>, keeping any other filters.
  if (categoryId) {
    const slug = (await getActiveCategories()).find((c) => c.id === categoryId)?.slug;
    const rest = new URLSearchParams({ ...(type && { type }), ...(search && { search }), ...(sort !== "newest" && { sort }) }).toString();
    redirect(`${slug ? `/shop/${slug}` : "/products"}${rest ? `?${rest}` : ""}`);
  }

  const queryClient = new QueryClient();
  await prefetchShopPage(queryClient, { search, sort, type: toProductType(type) });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsPageContent />
    </HydrationBoundary>
  );
}
