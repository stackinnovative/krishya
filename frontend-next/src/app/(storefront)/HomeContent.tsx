"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useFeaturedProducts } from "@/modules/products/hooks/useStorefrontProducts";
import ProductCard from "@/modules/products/components/storefront/ProductCard";
import { getBannerUserApi, getHeroUserApi, getTestimonialUserApi } from "@/modules/home-content/api/home-content.api";
import { getSignatureCategoriesApi } from "@/modules/categories/api/category.api";
import HeroCarousel from "@/modules/storefront-shell/components/HeroCarousel";
import PromoBanner from "@/modules/storefront-shell/components/PromoBanner";
import AboutSection from "@/modules/storefront-shell/components/AboutSection";
import TestimonialMarquee from "@/modules/storefront-shell/components/TestimonialMarquee";
import { categoryKeys, homeContentKeys } from "@/shared/query-keys";

/** Every query here is prefetched server-side by the parent page.tsx and
 * handed down through a HydrationBoundary - same queryKey/queryFn as here,
 * so on first load these resolve instantly from the hydrated cache instead
 * of firing a second client-side fetch (and, critically, so the homepage's
 * real content is present in the server-rendered HTML for SEO/crawlers). */
export default function HomeContent() {
  const { data: heroes } = useQuery({ queryKey: homeContentKeys.heroUser, queryFn: getHeroUserApi });
  const { data: banners } = useQuery({ queryKey: homeContentKeys.bannerUser, queryFn: getBannerUserApi });
  const { data: featured } = useFeaturedProducts();
  const { data: categories } = useQuery({ queryKey: categoryKeys.signature, queryFn: getSignatureCategoriesApi });
  const { data: testimonials } = useQuery({ queryKey: homeContentKeys.testimonialsUser, queryFn: getTestimonialUserApi });

  return (
    <div>
      <HeroCarousel slides={heroes?.data ?? []} />

      <PromoBanner banners={banners?.data ?? []} />

      {!!categories?.data?.length && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="mb-6 font-serif text-2xl font-semibold">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.data.map((c) => (
              <Link key={c.id} href={`/products?categoryId=${c.id}`} className="group text-center">
                <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full" style={{ background: "var(--bg-secondary)" }}>
                  {c.image && <Image src={getOptimizedImageUrl(c.image, 300)} alt={c.name} fill sizes="200px" className="object-cover transition-transform group-hover:scale-105" />}
                </div>
                <div className="mt-2 text-sm font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!!featured?.data?.length && (
        <section className="section-tint px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold">Featured</h2>
              <Link href="/products" className="text-sm font-medium underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {featured.data.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <AboutSection />

      <TestimonialMarquee testimonials={testimonials?.data ?? []} />
    </div>
  );
}
