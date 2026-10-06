"use client";

import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { HERO_ASPECT_RATIO } from "@/modules/home-content/constants";
import type { HeroView } from "@/modules/home-content/types/home-content.type";
import { useCarouselRotation } from "../hooks/useCarouselRotation";
import CarouselDots from "./CarouselDots";

export default function HeroCarousel({ slides }: { slides: HeroView[] }) {
  const [active, setActive] = useCarouselRotation(slides.length);

  if (slides.length === 0) {
    return (
      <section className="relative flex min-h-[70vh] items-center overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <h1 className="max-w-xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">Handcrafted, made with care</h1>
          <p className="mt-4 max-w-md" style={{ color: "var(--muted)" }}>
            Add a hero slide from the admin dashboard (Home Management → Hero) to customise this banner.
          </p>
          <Link href="/products" className="mt-6 inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white" style={{ background: "var(--accent)" }}>
            Shop now
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden" style={{ aspectRatio: HERO_ASPECT_RATIO }}>
      {slides.map((hero, i) => (
        <div key={hero.id} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}>
          {hero.image?.url && (
            <Image
              src={getOptimizedImageUrl(hero.image.url, 1600, Math.round(1600 / HERO_ASPECT_RATIO))}
              alt={hero.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(20,25,15,.72) 0%, rgba(20,25,15,.3) 60%, transparent 100%)" }} />
          <div className="relative flex h-full items-center">
            <div className="mx-auto max-w-6xl px-4 py-16 text-white">
              <h1 className="max-w-xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">{hero.title}</h1>
              {hero.subtitle && <p className="mt-4 max-w-md text-white/85">{hero.subtitle}</p>}
              {hero.buttonLabel && (
                <Link
                  href={hero.buttonUrl || "/products"}
                  className="mt-6 inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {hero.buttonLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      <CarouselDots count={slides.length} active={active} onSelect={setActive} keys={slides.map((s) => s.id)} />
    </section>
  );
}
