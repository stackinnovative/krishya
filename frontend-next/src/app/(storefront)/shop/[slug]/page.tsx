import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getActiveCategories } from "@/modules/categories/server";
import { getStoreInfo } from "@/modules/settings/server";
import ProductsPageContent from "../../products/ProductsPageContent";
import { prefetchShopPage, toProductType } from "../../products/prefetch";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string; search?: string; sort?: string }>;
};

const findCategory = async (slug: string) => (await getActiveCategories()).find((c) => c.slug === slug.toLowerCase());

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category, store] = await Promise.all([findCategory(slug), getStoreInfo()]);
  if (!category) return { title: "Category not found" };

  const description = `Shop ${category.name} at ${store.storeName} - classical Kerala Ayurveda preparations chosen for this health need.`;
  return {
    title: category.name,
    description,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: { title: `${category.name} | ${store.storeName}`, description },
  };
}

/** One health need's own page (/shop/hair-care) - the same shop listing, scoped to that category, with its own title for search engines. */
export default async function ShopCategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { type, search = "", sort = "newest" }] = await Promise.all([params, searchParams]);
  const category = await findCategory(slug);
  if (!category) notFound();

  const queryClient = new QueryClient();
  await prefetchShopPage(queryClient, { search, sort, categoryId: category.id, type: toProductType(type) });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsPageContent categorySlug={category.slug} />
    </HydrationBoundary>
  );
}
