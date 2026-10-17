"use client";

import { useQuery } from "@tanstack/react-query";
import { useFeaturedProducts, useProductList } from "@/modules/products/hooks/useStorefrontProducts";
import { getBannerUserApi, getHeroUserApi, getTestimonialUserApi } from "@/modules/home-content/api/home-content.api";
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
  PromoBanner,
  TestimonialsSection,
} from "@/modules/storefront-content/components/home/HomeSections";
import WhatsAppCta from "@/modules/storefront-shell/components/WhatsAppCta";
import { useStoreContact } from "@/modules/storefront-shell/hooks/useStoreContact";
import { useAbout } from "@/modules/about/hooks/useAbout";
import { useBlogList } from "@/modules/blog/hooks/useStorefrontBlogs";
import { HOME_BLOG_QUERY } from "@/modules/blog/constants";
import { ABOUT_FALLBACK } from "@/modules/about/constants";
import { useHomeFaqs } from "@/modules/faq/hooks/useStorefrontFaqs";
import { fillFaqAnswer } from "@/modules/faq/constants";
import { homeContentKeys } from "@/shared/query-keys";

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
  const { data: testimonials } = useQuery({ queryKey: homeContentKeys.testimonialsUser, queryFn: getTestimonialUserApi });
  const { data: banners } = useQuery({ queryKey: homeContentKeys.bannerUser, queryFn: getBannerUserApi });
  const store = useStoreContact();
  const { data: aboutRes } = useAbout();
  const { data: journal } = useBlogList(HOME_BLOG_QUERY);
  const { data: homeFaqs } = useHomeFaqs();
  const about = aboutRes?.data ?? ABOUT_FALLBACK;

  // Health needs = the active categories, in admin's sort order, each with its own icon.
  const needs: HealthNeed[] = activeCategories?.data ?? [];

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
      <PromoBanner banner={banners?.data?.[0]} alt={`Current offer at ${store.storeName}`} />
      <ProductShelf
        eyebrow="Handpicked for you"
        title="Featured Products"
        linkLabel="Explore the range"
        products={bestsellers.length ? more : []}
        decor="b"
        topPadding={false}
      />
      <HeritageSection teaser={about.teaser} stat={about.stat} />
      <ProcessSection />
      <TestimonialsSection testimonials={testimonials?.data ?? []} />
      <JournalPreview articles={journal?.data ?? []} />
      <FaqPreview faqs={(homeFaqs?.data ?? []).map((f) => ({ ...f, answer: fillFaqAnswer(f.answer, store) }))} />
      <WhatsAppCta />
    </div>
  );
}
