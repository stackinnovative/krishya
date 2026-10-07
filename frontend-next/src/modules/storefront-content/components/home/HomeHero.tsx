"use client";

import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/format";
import { useStorefrontUI } from "@/modules/storefront-shell/components/StorefrontUIProvider";
import { ArrowDownIcon, ArrowRightIcon, LeafIcon, LockIcon, MortarIcon, SearchIcon, ShieldCheckIcon, ShieldIcon, SproutIcon } from "@/modules/storefront-shell/components/icons";
import type { UserProductListItem } from "@/modules/products/types/storefront-product.type";

const DEFAULT_HERO_IMAGE = "/images/hero-oil-herbs.jpg";

export type HealthNeed = { id: string; name: string; image?: string };

type Props = {
  /** Admin's first active hero slide image, when one is set; the brand photo otherwise. */
  heroImage?: string;
  needs: HealthNeed[];
  spotlight?: UserProductListItem;
};

const heroSrc = (url?: string) => (url ? getOptimizedImageUrl(url, 900, 1200) : DEFAULT_HERO_IMAGE);

function AyushPill({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 whitespace-nowrap rounded-full bg-ka-cream py-2 pl-2 pr-4 font-semibold text-ka-green shadow-[0_16px_32px_-18px_rgba(31,77,58,.5)] ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-full bg-ka-gold text-ka-green">
        <ShieldIcon size={14} strokeWidth={2} />
      </span>
      AYUSH Certified
    </span>
  );
}

/** Phone hero: search pill, rounded mint card with the arched photo, then the "Shop by need" scroller and the 2x2 trust grid. */
function MobileHero({ heroImage, needs }: Props) {
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

      <div className="relative flex flex-col gap-3.5 overflow-hidden rounded-3xl bg-ka-mint px-[22px] pt-7">
        <span aria-hidden="true" className="absolute right-[-170px] top-[-150px] h-[360px] w-[360px] rounded-full border-[1.5px] border-ka-green/[.12]" />
        <span aria-hidden="true" className="absolute bottom-[-60px] left-[-90px] h-60 w-60 rounded-full bg-ka-mint-deep" />
        <span className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-ka-green">
          <span className="h-px w-[22px] bg-ka-gold" />
          Authentic Kerala Ayurveda
        </span>
        <h1 className="relative m-0 font-display text-[46px] font-semibold leading-[.98] tracking-[-.01em] text-ka-green">
          <span className="text-ka-gold-deep">Krishay</span>
          <br />
          Ayurveda
        </h1>
        <p className="relative m-0 max-w-[280px] text-[15px] leading-[1.55] text-ka-body-deep">Pure Kerala remedies, made by hand in small batches.</p>
        <Link
          href="/products"
          className="relative inline-flex h-12 items-center gap-2.5 self-start whitespace-nowrap rounded-full bg-ka-green px-6 text-[15px] font-semibold text-ka-cream shadow-[0_12px_24px_-14px_rgba(31,77,58,.8)]"
        >
          Shop Now
          <ArrowRightIcon size={16} strokeWidth={1.8} />
        </Link>
        <div className="relative mx-[-2px] mt-2.5 h-[300px]">
          <span aria-hidden="true" className="absolute right-[-6px] top-1.5 font-display text-[120px] font-semibold leading-[.8] tracking-[-.02em] text-ka-green/[.07]">
            AYUR
          </span>
          <div className="absolute bottom-0 left-[12%] right-0 top-[30px] overflow-hidden rounded-t-[200px] bg-[#C9D9C2] shadow-[0_-10px_40px_-20px_rgba(31,77,58,.5)]">
            <Image src={heroSrc(heroImage)} alt="Ayurvedic oil and herbs" fill priority sizes="90vw" className="object-cover" />
          </div>
          <AyushPill className="absolute bottom-[22px] left-0 text-[12.5px]" />
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

/** Circle used for a health-need category: its own image when the category has one, otherwise the striped leaf medallion. */
export function NeedCircle({ need, className, iconSize }: { need: HealthNeed; className: string; iconSize: number }) {
  return (
    <span
      className={`relative grid flex-none place-items-center overflow-hidden rounded-full border-[1.5px] border-ka-sage bg-ka-sand text-ka-green ${className}`}
      style={{ backgroundImage: "repeating-linear-gradient(135deg,rgba(31,77,58,.06) 0 1px,transparent 1px 9px)" }}
    >
      {need.image ? (
        <Image src={getOptimizedImageUrl(need.image, 300)} alt="" fill sizes="150px" className="object-cover" />
      ) : (
        <LeafIcon size={iconSize} strokeWidth={1.2} />
      )}
    </span>
  );
}

const TRUST_ITEMS = [
  { icon: <ShieldCheckIcon size={22} strokeWidth={1.5} />, title: "AYUSH Certified", sub: "Licensed manufacturing" },
  { icon: <SproutIcon size={22} strokeWidth={1.5} />, title: "100% Natural Herbs", sub: "No synthetic colours" },
  { icon: <MortarIcon size={22} strokeWidth={1.5} />, title: "Traditional Kerala Recipes", sub: "From classical texts" },
  { icon: <LockIcon size={22} strokeWidth={1.5} />, title: "Secure Payments", sub: "UPI, cards & net banking" },
];

/** Desktop hero: split layout with the arched photo, floating spotlight product and AYUSH pill, followed by the trust strip. */
function DesktopHero({ heroImage, spotlight }: Props) {
  return (
    <div className="hidden ka:block">
      <section className="relative overflow-hidden bg-ka-cream">
        <span aria-hidden="true" className="absolute left-[-260px] top-[-420px] h-[760px] w-[760px] rounded-full border-2 border-ka-green/[.07]" />
        <span aria-hidden="true" className="absolute bottom-[-300px] left-[30%] h-[520px] w-[520px] rounded-full border-2 border-ka-gold/[.18]" />
        <span aria-hidden="true" className="absolute bottom-0 right-0 top-0 w-[46%] rounded-bl-[320px] bg-ka-mint" />
        <div className="relative mx-auto grid min-h-[clamp(560px,48vw,700px)] max-w-[1280px] grid-cols-2 items-center gap-[clamp(32px,5vw,72px)] px-[clamp(20px,4vw,56px)] pb-[clamp(40px,4vw,64px)] pt-[calc(clamp(48px,6vw,96px)+clamp(60px,6vw,84px))]">
          <div className="flex flex-col items-start gap-[22px]">
            <span className="flex items-center gap-3 whitespace-nowrap text-xs font-bold uppercase tracking-[.2em] text-ka-green">
              <span className="h-px w-9 flex-none bg-ka-gold" />
              Authentic Kerala Ayurveda
            </span>
            <h1 className="m-0 font-display text-[clamp(56px,6.8vw,104px)] font-semibold leading-[.95] tracking-[-.015em] text-ka-green">
              <span className="text-ka-gold-deep">Krishay</span> Ayurveda
            </h1>
            <p className="m-0 max-w-[420px] text-[clamp(16px,1.3vw,18px)] leading-[1.6] text-ka-body-deep">
              Pure Kerala remedies, made by hand in small batches. From the House of Cochin Arya Vaidyasala.
            </p>
            <div className="mt-2.5 flex items-center gap-6">
              <Link
                href="/products"
                className="inline-flex h-[54px] items-center gap-2.5 whitespace-nowrap rounded-full bg-ka-green px-8 text-[15px] font-semibold text-ka-cream shadow-[0_16px_30px_-16px_rgba(31,77,58,.8)] hover:bg-ka-green-dark"
              >
                Shop Now
                <ArrowRightIcon size={18} strokeWidth={1.7} />
              </Link>
              <Link href="/about" className="whitespace-nowrap border-b border-ka-gold pb-[3px] text-[15px] font-semibold text-ka-green">
                Our Story
              </Link>
            </div>
            <a
              href="#home-health-needs"
              aria-label="Scroll to shop by health need"
              className="mt-[clamp(28px,4vw,64px)] grid h-11 w-11 place-items-center rounded-full border border-ka-sage text-ka-green"
            >
              <ArrowDownIcon size={18} />
            </a>
          </div>

          <div className="relative h-[clamp(440px,40vw,580px)]">
            <span aria-hidden="true" className="absolute right-[-10px] top-[-10px] whitespace-nowrap font-display text-[clamp(150px,15vw,230px)] font-semibold leading-[.8] tracking-[-.03em] text-ka-green/[.08]">
              AYUR
            </span>
            <div className="absolute bottom-0 left-[10%] right-[4%] top-[8%] overflow-hidden rounded-[400px_400px_24px_24px] bg-[#C9D9C2] shadow-[0_40px_80px_-40px_rgba(31,77,58,.55)]">
              <Image src={heroSrc(heroImage)} alt="Ayurvedic oil and herbs" fill priority sizes="45vw" className="object-cover" />
            </div>
            {spotlight && (
              <Link
                href={`/products/${spotlight.id}`}
                className="absolute bottom-9 left-0 flex max-w-[90%] items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 text-left shadow-[0_20px_40px_-20px_rgba(31,77,58,.5)]"
              >
                <span className="relative h-12 w-12 flex-none overflow-hidden rounded-full bg-ka-sand">
                  {spotlight.image && <Image src={getOptimizedImageUrl(spotlight.image, 120)} alt="" fill sizes="48px" className="object-cover" />}
                </span>
                <span className="flex min-w-0 flex-col gap-px">
                  <span className="truncate font-display text-lg font-semibold leading-[1.15] text-ka-green">{spotlight.name}</span>
                  <span className="whitespace-nowrap text-[12.5px] text-ka-muted">
                    Bestseller · from <span className="font-bold text-ka-gold-deep">{formatCurrency(spotlight.price)}</span>
                  </span>
                </span>
              </Link>
            )}
            <AyushPill className="absolute right-0 top-[22%] text-[13px]" />
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

export default function HomeHero(props: Props) {
  return (
    <>
      <MobileHero {...props} />
      <DesktopHero {...props} />
    </>
  );
}
