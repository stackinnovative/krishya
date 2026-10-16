"use client";

import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/format";
import { splitStoreName } from "@/modules/settings/store-info";
import { useStorefrontUI } from "@/modules/storefront-shell/components/StorefrontUIProvider";
import { ArrowDownIcon, ArrowRightIcon, LeafIcon, LockIcon, MortarIcon, SearchIcon, ShieldCheckIcon, ShieldIcon, SproutIcon } from "@/modules/storefront-shell/components/icons";
import { useProductDetails } from "@/modules/products/hooks/useStorefrontProducts";
import type { UserProductListItem } from "@/modules/products/types/storefront-product.type";
import { HERO_SLIDE_INTERVAL_MS } from "@/modules/home-content/constants";
import type { HeroView } from "@/modules/home-content/types/home-content.type";
import { useHeroSlideshow } from "../../hooks/useHeroSlideshow";
import { CATEGORY_ICON_MAP } from "@/modules/categories/constants/category-icons";
import type { StorefrontCategory } from "@/modules/categories/types/storefront-category.type";

const DEFAULT_HERO_IMAGE = "/images/hero-oil-herbs.jpg";

export type HealthNeed = StorefrontCategory;

/** One hero slide as rendered - an admin slide, or the built-in default when none are active. */
type Slide = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  image: string;
  buttonLabel: string;
  buttonUrl: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  badgeText?: string;
  spotlightLabel?: string;
  /** Admin slides: loaded by id. The default slide passes the product list item directly. */
  spotlightProductId?: string;
  spotlightItem?: UserProductListItem;
};

type Props = {
  storeName: string;
  /** Active admin slides in position order. Empty -> the built-in default hero. */
  heroes: HeroView[];
  /** True only while the first fetch is still in flight with nothing cached. */
  loading: boolean;
  needs: HealthNeed[];
  /** Spotlight for the default hero (first featured product). */
  defaultSpotlight?: UserProductListItem;
};

const toSlides = ({ heroes, storeName, defaultSpotlight }: Props): Slide[] =>
  heroes.length > 0
    ? heroes.map((h) => ({
        id: h.id,
        eyebrow: h.label,
        title: h.title,
        subtitle: h.subtitle,
        image: getOptimizedImageUrl(h.image.url, 960, 1200),
        buttonLabel: h.buttonLabel || "Shop Now",
        buttonUrl: h.buttonUrl || "/products",
        secondaryLabel: h.secondaryLabel,
        secondaryUrl: h.secondaryUrl,
        badgeText: h.badgeText,
        spotlightLabel: h.spotlightLabel,
        spotlightProductId: h.spotlightProductId,
      }))
    : [
        {
          id: "default",
          eyebrow: "Authentic Kerala Ayurveda",
          title: storeName,
          subtitle: "Pure Kerala remedies, made by hand in small batches. From the House of Cochin Arya Vaidyasala.",
          image: DEFAULT_HERO_IMAGE,
          buttonLabel: "Shop Now",
          buttonUrl: "/products",
          secondaryLabel: "Our Story",
          secondaryUrl: "/about",
          badgeText: "AYUSH Certified",
          spotlightLabel: "Bestseller",
          spotlightItem: defaultSpotlight,
        },
      ];

/** Headline size steps down for longer headlines so a 60-character one still sits in ~3 lines. */
const titleSize = (title: string, mobile: boolean) => {
  const n = title.length;
  if (mobile) return n <= 18 ? "text-[46px]" : n <= 32 ? "text-[38px]" : "text-[31px]";
  return n <= 18 ? "text-[clamp(56px,6.8vw,104px)]" : n <= 32 ? "text-[clamp(46px,5.2vw,80px)]" : "text-[clamp(38px,4.2vw,64px)]";
};

/** Cross-fade classes: hidden slides are also `invisible`, so their links can't be tabbed to or clicked. */
const fade = (on: boolean) =>
  on ? "visible opacity-100 [transition:opacity_.7s_ease,transform_.7s_ease,visibility_0s]" : "invisible opacity-0 [transition:opacity_.7s_ease,transform_.7s_ease,visibility_0s_.7s]";

const isExternal = (url: string) => /^https?:\/\//.test(url);

function SlideLink({ href, className, children, tabbable }: { href: string; className: string; children: React.ReactNode; tabbable: boolean }) {
  const common = { className, tabIndex: tabbable ? undefined : -1 };
  return isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" {...common}>
      {children}
    </a>
  ) : (
    <Link href={href} {...common}>
      {children}
    </Link>
  );
}

function Headline({ slide, first, mobile }: { slide: Slide; first: boolean; mobile: boolean }) {
  const { lead, rest } = splitStoreName(slide.title);
  const Tag = first ? "h1" : "h2";
  return (
    <Tag
      className={`relative m-0 break-words font-display font-semibold text-ka-green ${titleSize(slide.title, mobile)} ${
        mobile ? "leading-[.98] tracking-[-.01em]" : "text-balance leading-[.95] tracking-[-.015em]"
      }`}
    >
      <span className="text-ka-gold-deep">{lead}</span>
      {rest && (mobile && !rest.includes(" ") ? <><br />{rest}</> : ` ${rest}`)}
    </Tag>
  );
}

function Badge({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span
      className={`flex w-fit max-w-full items-center gap-2 whitespace-nowrap rounded-full bg-ka-cream py-2 pl-2 pr-4 font-semibold text-ka-green shadow-[0_16px_32px_-18px_rgba(31,77,58,.5)] ${className}`}
    >
      <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-ka-gold text-ka-green">
        <ShieldIcon size={14} strokeWidth={2} />
      </span>
      <span className="truncate">{text}</span>
    </span>
  );
}

type SpotlightData = { id: string; slug?: string; name: string; price: number; image?: string };

function SpotlightCard({ data, label, tabbable }: { data: SpotlightData; label?: string; tabbable: boolean }) {
  return (
    <Link
      href={data.slug ? `/products/${data.slug}` : "/products"}
      tabIndex={tabbable ? undefined : -1}
      className="absolute bottom-9 left-0 flex max-w-[90%] items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 text-left shadow-[0_20px_40px_-20px_rgba(31,77,58,.5)] transition-transform hover:-translate-y-0.5"
    >
      <span className="relative h-12 w-12 flex-none overflow-hidden rounded-full bg-ka-sand">
        {data.image && <Image src={getOptimizedImageUrl(data.image, 120)} alt="" fill sizes="48px" className="object-cover" />}
      </span>
      <span className="flex min-w-0 flex-col gap-px">
        <span className="truncate font-display text-lg font-semibold leading-[1.15] text-ka-green">{data.name}</span>
        <span className="truncate text-[12.5px] text-ka-muted">
          {label ? `${label} · ` : ""}from <span className="font-bold text-ka-gold-deep">{formatCurrency(data.price)}</span>
        </span>
      </span>
    </Link>
  );
}

/** Admin-picked spotlight: loads the product; renders nothing until it arrives, or if it's gone/hidden. */
function FetchedSpotlight({ productId, label, tabbable }: { productId: string; label?: string; tabbable: boolean }) {
  const { data } = useProductDetails(productId);
  const product = data?.data;
  if (!product || product.variants.length === 0) return null;
  const inStock = product.variants.filter((v) => v.stock > 0);
  const price = Math.min(...(inStock.length ? inStock : product.variants).map((v) => v.price));
  const image = product.images[0]?.url;
  return <SpotlightCard data={{ id: product.id, slug: product.slug, name: product.name, price, image }} label={label} tabbable={tabbable} />;
}

function Spotlight({ slide, tabbable }: { slide: Slide; tabbable: boolean }) {
  if (slide.spotlightProductId) return <FetchedSpotlight productId={slide.spotlightProductId} label={slide.spotlightLabel} tabbable={tabbable} />;
  if (slide.spotlightItem) return <SpotlightCard data={slide.spotlightItem} label={slide.spotlightLabel} tabbable={tabbable} />;
  return null;
}

function Dots({ count, active, onSelect }: { count: number; active: number; onSelect: (i: number) => void }) {
  if (count < 2) return null;
  return (
    <div className="flex items-center" role="group" aria-label="Choose slide">
      {Array.from({ length: count }, (_, i) => (
        <button key={i} type="button" onClick={() => onSelect(i)} aria-label={`Show slide ${i + 1} of ${count}`} aria-current={i === active} className="flex h-8 items-center px-1">
          <span
            className={`block h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-ka-gold" : "w-1.5 bg-ka-green/25"}`}
          />
        </button>
      ))}
    </div>
  );
}

function Bar({ className }: { className: string }) {
  return <span className={`block animate-pulse rounded-md bg-ka-green/10 ${className}`} />;
}

/** Phone hero: search pill, rounded mint card with the arched photo, then the "Shop by need" scroller and the 2x2 trust grid. */
function MobileHero({ slides, loading, needs, active, goTo }: { slides: Slide[]; loading: boolean; needs: HealthNeed[]; active: number; goTo: (i: number) => void }) {
  const { openSearch } = useStorefrontUI();

  return (
    <section className="relative isolate flex flex-col gap-[18px] overflow-clip px-4 pb-7 pt-[76px] ka:hidden">
      <span aria-hidden="true" className="pointer-events-none absolute left-[-220px] top-[-300px] -z-10 h-[520px] w-[520px] rounded-full border-2 border-ka-green/[.08]" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-[-120px] right-[-60px] -z-10 h-[220px] w-[220px] rounded-full border-[1.5px] border-ka-gold/[.28]" />

      <button
        type="button"
        onClick={openSearch}
        className="flex h-12 items-center gap-2.5 rounded-full border border-ka-line-soft bg-white px-4 text-left text-[14.5px] text-ka-grey shadow-[0_4px_14px_-10px_rgba(31,77,58,.4)]"
      >
        <SearchIcon size={19} strokeWidth={1.7} className="flex-none text-ka-green" />
        Search oils, churnams, hair care…
      </button>

      <div className="relative overflow-hidden rounded-3xl bg-ka-mint px-[22px] pt-7" aria-roledescription={slides.length > 1 ? "carousel" : undefined}>
        <span aria-hidden="true" className="absolute right-[-170px] top-[-150px] h-[360px] w-[360px] rounded-full border-[1.5px] border-ka-green/[.12]" />
        <span aria-hidden="true" className="absolute bottom-[-60px] left-[-90px] h-60 w-60 rounded-full bg-ka-mint-deep" />

        {loading ? (
          <div className="relative flex flex-col gap-3.5" aria-busy="true" aria-label="Loading">
            <Bar className="h-3 w-40" />
            <Bar className="h-11 w-3/4" />
            <Bar className="h-11 w-1/2" />
            <Bar className="h-4 w-4/5" />
            <Bar className="h-12 w-36 rounded-full" />
          </div>
        ) : (
          <div className="relative grid">
            {slides.map((s, i) => {
              const on = i === active;
              return (
                <div key={s.id} aria-hidden={!on} className={`flex flex-col gap-3.5 [grid-area:1/1] ${fade(on)} ${on ? "translate-y-0" : "translate-y-2"}`}>
                  {s.eyebrow && (
                    <span className="flex min-w-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-ka-green">
                      <span className="h-px w-[22px] flex-none bg-ka-gold" />
                      <span className="min-w-0 break-words">{s.eyebrow}</span>
                    </span>
                  )}
                  <Headline slide={s} first={i === 0} mobile />
                  <p className="m-0 line-clamp-3 max-w-[300px] break-words text-[15px] leading-[1.55] text-ka-body-deep sm:max-w-[460px]">{s.subtitle}</p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <SlideLink
                      href={s.buttonUrl}
                      tabbable={on}
                      className="inline-flex h-12 max-w-full items-center gap-2.5 whitespace-nowrap rounded-full bg-ka-green px-6 text-[15px] font-semibold text-ka-cream shadow-[0_12px_24px_-14px_rgba(31,77,58,.8)]"
                    >
                      <span className="truncate">{s.buttonLabel}</span>
                      <ArrowRightIcon size={16} strokeWidth={1.8} className="flex-none" />
                    </SlideLink>
                    {s.secondaryLabel && s.secondaryUrl && (
                      <SlideLink href={s.secondaryUrl} tabbable={on} className="whitespace-nowrap border-b border-ka-gold pb-[3px] text-[14.5px] font-semibold text-ka-green">
                        {s.secondaryLabel}
                      </SlideLink>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && slides.length > 1 && (
          <div className="relative -ml-1 mt-2">
            <Dots count={slides.length} active={active} onSelect={goTo} />
          </div>
        )}

        <div className="relative mx-[-2px] mt-6 h-[300px] sm:mx-auto sm:h-[400px] sm:w-full sm:max-w-[480px]">
          <span aria-hidden="true" className="absolute right-[-6px] top-1.5 font-display text-[120px] font-semibold leading-[.8] tracking-[-.02em] text-ka-green/[.07]">
            AYUR
          </span>
          <div className="absolute bottom-0 left-[12%] right-0 top-[30px] overflow-hidden rounded-t-[200px] bg-[#C9D9C2] shadow-[0_-10px_40px_-20px_rgba(31,77,58,.5)]">
            {loading ? (
              <span className="block h-full w-full animate-pulse bg-ka-green/10" />
            ) : (
              slides.map((s, i) => (
                <div key={s.id} className={`absolute inset-0 ${fade(i === active)}`}>
                  <Image src={s.image} alt="" fill priority={i === 0} sizes="90vw" className="object-cover" />
                </div>
              ))
            )}
          </div>
          {!loading &&
            slides.map((s, i) =>
              s.badgeText ? (
                <div key={s.id} aria-hidden={i !== active} className={`absolute bottom-[22px] left-0 right-2 ${fade(i === active)}`}>
                  <Badge text={s.badgeText} className="text-[12.5px]" />
                </div>
              ) : null,
            )}
        </div>
      </div>

      {needs.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-semibold text-ka-green">Shop by need</span>
            <Link href="/products" className="py-1.5 text-[13.5px] font-semibold text-ka-green">
              See all
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-1.5 pt-0.5">
            {needs.map((c) => (
              <Link key={c.id} href={`/products?categoryId=${c.id}`} className="flex w-[76px] flex-none flex-col items-center gap-2">
                <NeedCircle need={c} className="h-[68px] w-[68px]" iconSize={26} />
                <span className="text-center text-xs font-semibold leading-tight text-ka-green">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {[
          { icon: <ShieldIcon size={18} strokeWidth={1.5} />, label: "AYUSH Certified" },
          { icon: <SproutIcon size={18} strokeWidth={1.5} />, label: "100% Natural" },
          { icon: <MortarIcon size={18} strokeWidth={1.5} />, label: "Kerala Recipes" },
          { icon: <LockIcon size={18} strokeWidth={1.5} />, label: "Secure Payments" },
        ].map((t) => (
          <span key={t.label} className="flex items-center gap-2 rounded-xl bg-ka-mint p-3 text-[12.5px] font-semibold text-ka-green">
            <span className="flex-none">{t.icon}</span>
            {t.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/** Circle used for a health-need category: the striped medallion with the icon admin picked (a leaf if it's unknown). */
export function NeedCircle({ need, className, iconSize }: { need: HealthNeed; className: string; iconSize: number }) {
  const Icon = CATEGORY_ICON_MAP[need.icon];
  return (
    <span
      className={`relative grid flex-none place-items-center overflow-hidden rounded-full border-[1.5px] border-ka-sage bg-ka-sand text-ka-green ${className}`}
      style={{ backgroundImage: "repeating-linear-gradient(135deg,rgba(31,77,58,.06) 0 1px,transparent 1px 9px)" }}
    >
      {Icon ? <Icon size={iconSize} strokeWidth={1.2} /> : <LeafIcon size={iconSize} strokeWidth={1.2} />}
    </span>
  );
}

const TRUST_ITEMS = [
  { icon: <ShieldCheckIcon size={22} strokeWidth={1.5} />, title: "AYUSH Certified", sub: "Licensed manufacturing" },
  { icon: <SproutIcon size={22} strokeWidth={1.5} />, title: "100% Natural Herbs", sub: "No synthetic colours" },
  { icon: <MortarIcon size={22} strokeWidth={1.5} />, title: "Traditional Kerala Recipes", sub: "From classical texts" },
  { icon: <LockIcon size={22} strokeWidth={1.5} />, title: "Secure Payments", sub: "UPI, cards & net banking" },
];

/** Desktop hero: split layout with the arched photo, floating spotlight product and badge, followed by the trust strip. */
function DesktopHero({ slides, loading, active, goTo }: { slides: Slide[]; loading: boolean; active: number; goTo: (i: number) => void }) {
  return (
    <div className="hidden ka:block">
      <section className="relative overflow-hidden bg-ka-cream" aria-roledescription={slides.length > 1 ? "carousel" : undefined}>
        <span aria-hidden="true" className="absolute left-[-260px] top-[-420px] h-[760px] w-[760px] rounded-full border-2 border-ka-green/[.07]" />
        <span aria-hidden="true" className="absolute bottom-[-300px] left-[30%] h-[520px] w-[520px] rounded-full border-2 border-ka-gold/[.18]" />
        <span aria-hidden="true" className="absolute bottom-0 right-0 top-0 w-[46%] rounded-bl-[320px] bg-ka-mint" />
        <div className="relative mx-auto grid min-h-[clamp(560px,48vw,700px)] max-w-[1280px] grid-cols-2 items-center gap-[clamp(32px,5vw,72px)] px-[clamp(20px,4vw,56px)] pb-[clamp(40px,4vw,64px)] pt-[calc(clamp(48px,6vw,96px)+clamp(60px,6vw,84px))]">
          <div className="flex min-w-0 flex-col items-start">
            {loading ? (
              <div className="flex w-full flex-col gap-[22px]" aria-busy="true" aria-label="Loading">
                <Bar className="h-3 w-56" />
                <Bar className="h-20 w-4/5" />
                <Bar className="h-20 w-3/5" />
                <Bar className="h-5 w-[420px] max-w-full" />
                <Bar className="h-[54px] w-44 rounded-full" />
              </div>
            ) : (
              <div className="grid w-full">
                {slides.map((s, i) => {
                  const on = i === active;
                  return (
                    <div key={s.id} aria-hidden={!on} className={`flex min-w-0 flex-col items-start gap-[22px] [grid-area:1/1] ${fade(on)} ${on ? "translate-y-0" : "translate-y-3"}`}>
                      {s.eyebrow && (
                        <span className="flex max-w-full items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-ka-green">
                          <span className="h-px w-9 flex-none bg-ka-gold" />
                          <span className="min-w-0 break-words">{s.eyebrow}</span>
                        </span>
                      )}
                      <Headline slide={s} first={i === 0} mobile={false} />
                      <p className="m-0 line-clamp-3 max-w-[440px] break-words text-[clamp(16px,1.3vw,18px)] leading-[1.6] text-ka-body-deep">{s.subtitle}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-4">
                        <SlideLink
                          href={s.buttonUrl}
                          tabbable={on}
                          className="inline-flex h-[54px] max-w-full items-center gap-2.5 whitespace-nowrap rounded-full bg-ka-green px-8 text-[15px] font-semibold text-ka-cream shadow-[0_16px_30px_-16px_rgba(31,77,58,.8)] hover:bg-ka-green-dark"
                        >
                          <span className="truncate">{s.buttonLabel}</span>
                          <ArrowRightIcon size={18} strokeWidth={1.7} className="flex-none" />
                        </SlideLink>
                        {s.secondaryLabel && s.secondaryUrl && (
                          <SlideLink href={s.secondaryUrl} tabbable={on} className="whitespace-nowrap border-b border-ka-gold pb-[3px] text-[15px] font-semibold text-ka-green">
                            {s.secondaryLabel}
                          </SlideLink>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-[clamp(28px,4vw,64px)] flex items-center gap-5">
              <a href="#home-health-needs" aria-label="Scroll to shop by health need" className="grid h-11 w-11 flex-none place-items-center rounded-full border border-ka-sage text-ka-green">
                <ArrowDownIcon size={18} />
              </a>
              <Dots count={loading ? 0 : slides.length} active={active} onSelect={goTo} />
            </div>
          </div>

          <div className="relative h-[clamp(440px,40vw,580px)]">
            <span aria-hidden="true" className="absolute right-[-10px] top-[-10px] whitespace-nowrap font-display text-[clamp(150px,15vw,230px)] font-semibold leading-[.8] tracking-[-.03em] text-ka-green/[.08]">
              AYUR
            </span>
            <div className="absolute bottom-0 left-[10%] right-[4%] top-[8%] overflow-hidden rounded-[400px_400px_24px_24px] bg-[#C9D9C2] shadow-[0_40px_80px_-40px_rgba(31,77,58,.55)]">
              {loading ? (
                <span className="block h-full w-full animate-pulse bg-ka-green/10" />
              ) : (
                slides.map((s, i) => (
                  <div key={s.id} className={`absolute inset-0 ${fade(i === active)}`}>
                    <Image src={s.image} alt="" fill priority={i === 0} sizes="45vw" className="object-cover" />
                  </div>
                ))
              )}
            </div>
            {!loading &&
              slides.map((s, i) => {
                const on = i === active;
                return (
                  <div key={s.id} aria-hidden={!on} className={`pointer-events-none absolute inset-0 [&>*]:pointer-events-auto ${fade(on)}`}>
                    <Spotlight slide={s} tabbable={on} />
                    {s.badgeText && (
                      <div className="absolute right-0 top-[22%] flex w-[62%] justify-end">
                        <Badge text={s.badgeText} className="text-[13px]" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-clip border-y border-ka-gold/35 bg-ka-ivory">
        <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(44%,230px),1fr))] gap-6 px-[clamp(20px,4vw,56px)] py-[clamp(24px,2.6vw,36px)]">
          {TRUST_ITEMS.map((t) => (
            <div key={t.title} className="flex items-center gap-3.5">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-ka-mint text-ka-green">{t.icon}</span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold text-ka-green">{t.title}</span>
                <span className="text-[13px] text-ka-muted">{t.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Home hero: the admin's active slides as a cross-fading slideshow (one slide = static), or the built-in default. */
export default function HomeHero(props: Props) {
  const slides = toSlides(props);
  const { active, goTo, bind } = useHeroSlideshow(props.loading ? 0 : slides.length, HERO_SLIDE_INTERVAL_MS);

  return (
    <div {...bind}>
      <MobileHero slides={slides} loading={props.loading} needs={props.needs} active={active} goTo={goTo} />
      <DesktopHero slides={slides} loading={props.loading} active={active} goTo={goTo} />
    </div>
  );
}
