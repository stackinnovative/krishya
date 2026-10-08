"use client";

import { useQuery } from "@tanstack/react-query";
import { useFeaturedProducts, useProductList } from "@/modules/products/hooks/useStorefrontProducts";
import { getHeroUserApi, getTestimonialUserApi } from "@/modules/home-content/api/home-content.api";
import { getSignatureCategoriesApi } from "@/modules/categories/api/category.api";
import { useActiveCategories } from "@/modules/categories/hooks/useStorefrontCategories";
import type { UserProductListItem } from "@/modules/products/types/storefront-product.type";
import HomeHero, { type HealthNeed } from "@/modules/storefront-content/components/home/HomeHero";
import {
  FaqPreview,
  HealthNeedsSection,
  HeritageSection,
  JournalPreview,
  ProcessSection,
  ProductShelf,
  TestimonialsSection,
} from "@/modules/storefront-content/components/home/HomeSections";
import WhatsAppCta from "@/modules/storefront-shell/components/WhatsAppCta";
import { useStoreContact } from "@/modules/storefront-shell/hooks/useStoreContact";
import { getHomeFaqs } from "@/modules/storefront-content/constants/faqs";
import { categoryKeys, homeContentKeys } from "@/shared/query-keys";

const NEWEST_FILTERS = { search: "", sort: "newest" };

/** Every query here is prefetched server-side by the parent page.tsx and
 * handed down through a HydrationBoundary - same queryKey/queryFn as here,
 * so on first load these resolve instantly from the hydrated cache instead
 * of firing a second client-side fetch (and, critically, so the homepage's
 * real content is present in the server-rendered HTML for SEO/crawlers). */
export default function HomeContent() {
  const { data: heroes, isPending: heroesPending } = useQuery({ queryKey: homeContentKeys.heroUser, queryFn: getHeroUserApi });
  const { data: featured } = useFeaturedProducts();
  const { data: newest } = useProductList(NEWEST_FILTERS);
  const { data: activeCategories } = useActiveCategories();
  const { data: signature } = useQuery({ queryKey: categoryKeys.signature, queryFn: getSignatureCategoriesApi });
  const { data: testimonials } = useQuery({ queryKey: homeContentKeys.testimonialsUser, queryFn: getTestimonialUserApi });
  const store = useStoreContact();

  // Health needs = the active categories, using a signature category's image where one exists.
  const imageById = new Map((signature?.data ?? []).map((c) => [c.id, c.image]));
  const needs: HealthNeed[] = (activeCategories?.data ?? []).map((c) => ({ id: c.id, name: c.name, image: imageById.get(c.id) || undefined }));

  // "Bestsellers" are the admin's featured picks; "Featured Products" continues
  // with the rest of them, topped up from the newest arrivals.
  const featuredItems = featured?.data ?? [];
  const bestsellers = featuredItems.slice(0, 4);
  const shownIds = new Set(bestsellers.map((p) => p.id));
  const newestItems = newest?.pages[0]?.data ?? [];
  const more: UserProductListItem[] = [];
  for (const p of [...featuredItems.slice(4), ...newestItems]) {
    if (more.length === 4) break;
    if (shownIds.has(p.id)) continue;
    shownIds.add(p.id);
    more.push(p);
  }

  return (
    <div>
      <HomeHero storeName={store.storeName} heroes={heroes?.data ?? []} loading={heroesPending} needs={needs} defaultSpotlight={bestsellers[0] ?? newestItems[0]} />
      <HealthNeedsSection needs={needs} />
      <ProductShelf eyebrow="Most loved" title="Bestsellers" linkLabel="View all products" products={bestsellers.length ? bestsellers : newestItems.slice(0, 4)} decor="c" />
      <ProductShelf
        eyebrow="Handpicked for you"
        title="Featured Products"
        linkLabel="Explore the range"
        products={bestsellers.length ? more : []}
        decor="b"
        topPadding={false}
      />
      <HeritageSection storeName={store.storeName} />
      <ProcessSection />
      <TestimonialsSection testimonials={testimonials?.data ?? []} />
      <JournalPreview />
      <FaqPreview faqs={getHomeFaqs(store)} />
      <WhatsAppCta />
    </div>
  );
}
