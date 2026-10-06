"use client";

import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { BANNER_ASPECT_RATIO } from "@/modules/home-content/constants";
import type { BannerView } from "@/modules/home-content/types/home-content.type";
import { useCarouselRotation } from "../hooks/useCarouselRotation";
import CarouselDots from "./CarouselDots";

export default function PromoBanner({ banners }: { banners: BannerView[] }) {
  const visibleBanners = banners.filter((b) => b.image?.url);
  const [active, setActive] = useCarouselRotation(visibleBanners.length);

  if (visibleBanners.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: BANNER_ASPECT_RATIO, background: "var(--bg-secondary)" }}>
        {visibleBanners.map((banner, i) => {
          const image = (
            <Image
              src={getOptimizedImageUrl(banner.image.url, 1400, Math.round(1400 / BANNER_ASPECT_RATIO))}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          );

          return (
            <div
              key={banner.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
            >
              {banner.buttonUrl ? (
                <Link href={banner.buttonUrl} className="absolute inset-0 block">
                  {image}
                </Link>
              ) : (
                image
              )}
            </div>
          );
        })}
        <CarouselDots count={visibleBanners.length} active={active} onSelect={setActive} keys={visibleBanners.map((b) => b.id)} />
      </div>
    </section>
  );
}
