import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/modules/products/components/storefront/ProductCard";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { ABOUT_FALLBACK_IMAGES } from "@/modules/about/constants";
import type { AboutStat, AboutTeaser } from "@/modules/about/types/about.type";
import type { UserProductListItem } from "@/modules/products/types/storefront-product.type";
import type { TestimonialView } from "@/modules/home-content/types/home-content.type";
import { CONTAINER, Eyebrow, LeafDivider, SECTION_TITLE, SectionDecor, Wave } from "@/modules/storefront-shell/components/decor";
import { ArrowRightIcon, FlaskIcon, SproutIcon, TruckIcon, UruliIcon } from "@/modules/storefront-shell/components/icons";
import ArticleCard from "../ArticleCard";
import FaqAccordion from "../FaqAccordion";
import type { BlogListItem } from "@/modules/blog/types/blog.type";
import type { Faq } from "../../constants/faqs";
import { NeedCircle, type HealthNeed } from "./HomeHero";

const MINT = "#E8F0E4";
const CREAM = "#FAF6EE";
const SAND = "#EFE6D8";

/** Underlined text link with an arrow ("View all products", "Read Our Story", ...). */
export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 self-start whitespace-nowrap border-b border-ka-gold pb-[3px] text-[15px] font-semibold text-ka-green">
      {children}
      <ArrowRightIcon size={16} />
    </Link>
  );
}

/** Desktop-only "Shop by Health Need" grid of category medallions (phones get the scroller inside the hero). */
export function HealthNeedsSection({ needs }: { needs: HealthNeed[] }) {
  if (needs.length === 0) return null;
  return (
    <div className="hidden ka:block">
      <Wave from={CREAM} to={MINT} />
      <section id="home-health-needs" className="relative isolate scroll-mt-24 overflow-clip bg-ka-mint py-[clamp(56px,7vw,112px)]">
        <SectionDecor variant="b" />
        <div className={CONTAINER}>
          <div className="mb-[clamp(32px,4vw,56px)] flex flex-col items-center gap-3.5 text-center">
            <LeafDivider />
            <h2 className={SECTION_TITLE}>Shop by Health Need</h2>
            <p className="m-0 max-w-[520px] text-base leading-[1.6] text-ka-body">Find preparations traditionally used for your everyday wellbeing.</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(44%,170px),1fr))] gap-[clamp(12px,1.8vw,24px)]">
            {needs.map((c) => (
              <Link key={c.id} href={`/products?categoryId=${c.id}`} className="flex flex-col items-center gap-3 text-center transition-transform hover:-translate-y-[3px]">
                <NeedCircle need={c} className="mb-1.5 aspect-square w-[min(100%,148px)]" iconSize={48} />
                <span className="font-display text-[clamp(19px,1.6vw,22px)] font-semibold leading-[1.15] text-ka-green">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Wave from={MINT} to={CREAM} shape="b" />
    </div>
  );
}

/** A titled product grid ("Bestsellers", "Featured Products"). */
export function ProductShelf({
  eyebrow,
  title,
  linkLabel,
  products,
  decor,
  topPadding = true,
}: {
  eyebrow: string;
  title: string;
  linkLabel: string;
  products: UserProductListItem[];
  decor: "b" | "c";
  topPadding?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <section className={`relative isolate overflow-clip pb-[clamp(28px,7vw,112px)] ${topPadding ? "pt-[clamp(28px,7vw,112px)]" : ""}`}>
      <SectionDecor variant={decor} />
      <div className={CONTAINER}>
        <div className="mb-[clamp(18px,3.6vw,48px)] flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className={SECTION_TITLE}>{title}</h2>
          </div>
          <ArrowLink href="/products">{linkLabel}</ArrowLink>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(44%,250px),1fr))] gap-[clamp(12px,2vw,28px)]">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Short "Our Heritage" teaser from the admin About content - links to the full About page. */
export function HeritageSection({ teaser, stat }: { teaser: AboutTeaser; stat: AboutStat }) {
  // Hidden from admin: keep the colour join into the next (mint) section.
  if (!teaser.showOnHome) return <Wave from={CREAM} to={MINT} shape="b" />;

  const photo = teaser.image ? getOptimizedImageUrl(teaser.image.url, 900, 1080) : ABOUT_FALLBACK_IMAGES.teaser;

  return (
    <>
      <Wave from={CREAM} to={SAND} />
      <section className="relative isolate overflow-clip bg-ka-sand py-[clamp(56px,7vw,112px)]">
        <SectionDecor variant="d" />
        <div className={`${CONTAINER} grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-[clamp(32px,6vw,96px)]`}>
          <div className="relative aspect-[5/6] overflow-hidden rounded-xl bg-[#E4EADB]">
            <Image src={photo} alt={teaser.title} fill sizes="(max-width: 960px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-col gap-[22px]">
            {teaser.eyebrow && <Eyebrow>{teaser.eyebrow}</Eyebrow>}
            <h2 className={`${SECTION_TITLE} text-balance break-words`}>{teaser.title}</h2>
            <p className="m-0 whitespace-pre-line text-pretty break-words text-base leading-[1.75] text-ka-body">{teaser.summary}</p>
            {stat.value && stat.label && (
              <div className="flex items-center gap-5 border-y border-ka-gold/55 py-5">
                <span className="flex-none font-display text-[clamp(56px,6vw,84px)] font-medium leading-[.9] text-ka-gold">{stat.value}</span>
                <span className="max-w-[220px] text-[15px] font-medium leading-normal text-ka-green">{stat.label}</span>
              </div>
            )}
            <ArrowLink href="/about">{teaser.linkLabel}</ArrowLink>
          </div>
        </div>
      </section>
      <Wave from={SAND} to={MINT} shape="b" />
    </>
  );
}

const PROCESS_STEPS = [
  { icon: <SproutIcon size={30} strokeWidth={1.3} />, title: "Hand-picked Herbs", body: "Gathered in season from trusted growers across Kerala's hills and backwaters." },
  { icon: <UruliIcon size={30} strokeWidth={1.3} />, title: "Traditional Preparation", body: "Oils and decoctions cooked slowly in bronze vessels, as the classical texts describe." },
  { icon: <FlaskIcon size={30} strokeWidth={1.3} />, title: "Quality Tested", body: "Every batch checked for purity and consistency in our AYUSH-licensed facility." },
  { icon: <TruckIcon size={30} strokeWidth={1.3} />, title: "Delivered to Your Door", body: "Packed carefully and shipped across India, with updates on WhatsApp." },
];

export function ProcessSection() {
  return (
    <>
      <section className="relative isolate overflow-clip bg-ka-mint py-[clamp(56px,7vw,112px)]">
        <SectionDecor variant="a" />
        <div className={CONTAINER}>
          <div className="mb-[clamp(36px,4.4vw,64px)] flex flex-col items-center gap-3.5 text-center">
            <LeafDivider />
            <h2 className={SECTION_TITLE}>How It&apos;s Made</h2>
          </div>
          <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-[clamp(28px,3vw,40px)] p-0">
            {PROCESS_STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col items-center gap-3.5 text-center">
                <span className="grid h-[76px] w-[76px] place-items-center rounded-full border border-ka-sage bg-ka-cream text-ka-green">{s.icon}</span>
                <span className="text-xs font-bold tracking-[.2em] text-ka-gold-text">STEP 0{i + 1}</span>
                <span className="font-display text-[25px] font-semibold text-ka-green">{s.title}</span>
                <span className="max-w-[260px] text-[14.5px] leading-[1.6] text-ka-body">{s.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Wave from={MINT} to={CREAM} />
    </>
  );
}

export function TestimonialsSection({ testimonials }: { testimonials: TestimonialView[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="relative isolate overflow-clip py-[clamp(56px,7vw,112px)]">
      <SectionDecor variant="b" />
      <div className={CONTAINER}>
        <div className="mb-[clamp(32px,4vw,56px)] flex flex-col items-center gap-3.5 text-center">
          <Eyebrow centered>Kind words</Eyebrow>
          <h2 className={SECTION_TITLE}>From our customers</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-[clamp(16px,2vw,24px)]">
          {testimonials.slice(0, 4).map((t) => (
            <figure key={t.id} className="m-0 flex flex-col gap-[18px] rounded-xl bg-ka-sand px-[26px] py-7">
              <span aria-hidden="true" className="h-[22px] font-display text-[56px] leading-[.6] text-ka-gold">
                &ldquo;
              </span>
              <blockquote className="m-0 flex-1 text-pretty font-display text-[21px] italic leading-[1.4] text-ka-green">{t.comment}</blockquote>
              <figcaption className="border-t border-ka-gold/50 pt-4 text-[14.5px] font-semibold text-ka-ink">{t.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Latest three articles - hidden until the store publishes its first one. */
export function JournalPreview({ articles }: { articles: BlogListItem[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="relative isolate overflow-clip pb-[clamp(56px,7vw,112px)]">
      <SectionDecor variant="c" />
      <div className={CONTAINER}>
        <div className="mb-[clamp(28px,3.6vw,48px)] flex flex-wrap items-end justify-between gap-4 border-t border-ka-gold/40 pt-[clamp(48px,6vw,96px)]">
          <div className="flex flex-col gap-3">
            <Eyebrow>Journal</Eyebrow>
            <h2 className={SECTION_TITLE}>From Our Blog</h2>
          </div>
          <ArrowLink href="/blog">Read all articles</ArrowLink>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[clamp(20px,2.4vw,32px)]">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} showDate={false} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqPreview({ faqs }: { faqs: Faq[] }) {
  return (
    <>
      <Wave from={CREAM} to={MINT} shape="b" />
      <section className="relative isolate overflow-clip bg-ka-mint py-[clamp(56px,7vw,112px)]">
        <SectionDecor variant="d" />
        <div className="mx-auto max-w-[860px] px-[clamp(20px,4vw,56px)]">
          <div className="mb-[clamp(28px,3.6vw,48px)] flex flex-col items-center gap-3.5 text-center">
            <LeafDivider />
            <h2 className={SECTION_TITLE}>Frequently asked questions</h2>
          </div>
          <div className="border-t border-ka-green/[.18]">
            <FaqAccordion items={faqs} defaultOpen={0} />
          </div>
          <div className="mt-9 flex justify-center">
            <Link
              href="/faq"
              className="inline-flex h-12 items-center whitespace-nowrap rounded-lg border border-ka-gold px-[26px] text-[15px] font-semibold text-ka-green hover:bg-ka-gold/[.12]"
            >
              View all FAQs
            </Link>
          </div>
        </div>
      </section>
      <Wave from={MINT} to={CREAM} shape="b" />
    </>
  );
}
