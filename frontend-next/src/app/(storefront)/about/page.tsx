import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CONTAINER, Eyebrow, SectionDecor, Wave } from "@/modules/storefront-shell/components/decor";
import { HeartIcon, MortarIcon, SproutIcon } from "@/modules/storefront-shell/components/icons";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { getAbout } from "@/modules/about/server";
import { ABOUT_FALLBACK_IMAGES } from "@/modules/about/constants";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return { title: about.header.title, description: about.teaser.summary };
}

const VALUES = [
  { icon: <MortarIcon size={24} strokeWidth={1.4} />, title: "Authenticity", body: "Every formulation follows classical Ayurvedic texts, prepared the traditional Kerala way." },
  {
    icon: <SproutIcon size={24} strokeWidth={1.4} />,
    title: "Purity",
    body: "Natural herbs and oils, with no synthetic colours or fragrances, made in an AYUSH-licensed facility.",
  },
  {
    icon: <HeartIcon size={24} strokeWidth={1.4} />,
    title: "Honesty",
    body: "Clear descriptions of traditional use, with no exaggerated claims. When in doubt, we suggest asking a physician.",
  },
];

const H2 = "m-0 font-display text-[clamp(32px,3.4vw,48px)] font-medium leading-[1.1] text-ka-green";

export default async function AboutPage() {
  const { header, story, stat, tribute, craft } = await getAbout();
  const headerPhoto = header.image ? getOptimizedImageUrl(header.image.url, 1600, 700) : ABOUT_FALLBACK_IMAGES.header;
  const hasStat = Boolean(stat.value && stat.label);

  return (
    <>
      <section className="relative isolate overflow-clip pb-[clamp(40px,5vw,72px)] pt-[clamp(48px,6vw,96px)]">
        <SectionDecor variant="a" />
        <div className="mx-auto flex max-w-[880px] flex-col items-center gap-[18px] px-[clamp(20px,4vw,56px)] text-center">
          {header.eyebrow && <Eyebrow centered>{header.eyebrow}</Eyebrow>}
          <h1 className="m-0 text-balance break-words font-display text-[clamp(42px,5vw,72px)] font-medium leading-[1.04] text-ka-green">{header.title}</h1>
          {header.subtitle && <p className="m-0 text-balance font-display text-[clamp(20px,1.7vw,24px)] italic text-ka-green">{header.subtitle}</p>}
        </div>
        <div className={`${CONTAINER} mt-[clamp(36px,4.4vw,64px)]`}>
          <div className="relative h-[clamp(260px,36vw,520px)] overflow-hidden rounded-xl bg-ka-mint">
            <Image src={headerPhoto} alt={header.title} fill priority sizes="100vw" className={`object-cover ${header.image ? "" : "object-[50%_60%]"}`} />
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-clip pb-[clamp(56px,7vw,112px)]">
        <SectionDecor variant="b" />
        <div className={`${CONTAINER} grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(28px,6vw,96px)]`}>
          <div className="flex flex-col gap-[18px] ka:sticky ka:top-[120px]">
            <h2 className={`${H2} text-balance break-words`}>{story.heading}</h2>
            {hasStat && (
              <div className="flex max-w-[360px] items-center gap-5 border-y border-ka-gold/55 py-[18px]">
                <span className="flex-none font-display text-[72px] font-medium leading-[.9] text-ka-gold">{stat.value}</span>
                <span className="text-[15px] font-medium leading-normal text-ka-green">{stat.label}</span>
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-[18px] text-[16.5px] leading-[1.8] text-[#3F423B]">
            {story.paragraphs.map((p, i) => (
              <p key={i} className="m-0 whitespace-pre-line text-pretty break-words">
                {p}
              </p>
            ))}
            {story.closing && (
              <p className="m-0 mt-2 whitespace-pre-line border-l-2 border-ka-gold pl-5 font-display text-[clamp(22px,2vw,26px)] italic leading-[1.35] text-ka-gold-deep">
                {story.closing}
              </p>
            )}
          </div>
        </div>
      </section>

      {tribute.image && (
        <section className="relative isolate overflow-clip pb-[clamp(56px,7vw,112px)]">
          <SectionDecor variant="c" />
          <div className={`${CONTAINER} grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-center gap-[clamp(32px,6vw,96px)]`}>
            <div className="relative mx-auto aspect-square w-[min(100%,420px)]">
              <span aria-hidden="true" className="absolute inset-0 rounded-full border-[1.5px] border-ka-gold/70" />
              <span aria-hidden="true" className="absolute inset-[3%] rotate-6 rounded-full border border-ka-gold/45" />
              <div className="absolute inset-[7%] overflow-hidden rounded-full bg-ka-sand">
                <Image src={getOptimizedImageUrl(tribute.image.url, 800, 1000)} alt={tribute.name || "In loving memory"} fill sizes="(max-width: 820px) 80vw, 400px" className="object-cover object-top" />
              </div>
            </div>
            <figure className="m-0 flex flex-col gap-5">
              <span aria-hidden="true" className="h-[30px] font-display text-[72px] leading-[.6] text-ka-gold">
                &ldquo;
              </span>
              {tribute.quote && (
                <blockquote className="m-0 text-balance break-words font-display text-[clamp(28px,3vw,40px)] italic leading-[1.3] text-ka-green">{tribute.quote}</blockquote>
              )}
              {(tribute.name || tribute.role) && (
                <figcaption className="flex flex-col gap-1 border-t border-ka-gold/50 pt-4">
                  {tribute.name && <span className="text-[16px] font-semibold text-ka-ink">{tribute.name}</span>}
                  {tribute.role && <span className="text-[14px] text-ka-muted">{tribute.role}</span>}
                </figcaption>
              )}
            </figure>
          </div>
        </section>
      )}

      <Wave from="#FAF6EE" to="#1F4D3A" shape="b" />
      <section className="relative isolate overflow-clip bg-ka-green py-[clamp(56px,7vw,104px)]">
        <SectionDecor variant="c" dark />
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-[18px] px-[clamp(20px,4vw,56px)] text-center">
          <span className="text-xs font-bold tracking-[.22em] text-ka-gold">OUR MISSION</span>
          <p className="m-0 text-balance font-display text-[clamp(28px,3.2vw,44px)] font-medium leading-[1.25] text-ka-cream">
            To make authentic Kerala Ayurveda simple to understand, easy to reach and true to its roots.
          </p>
        </div>
      </section>
      <Wave from="#1F4D3A" to="#FAF6EE" />

      <section className="relative isolate overflow-clip py-[clamp(56px,7vw,112px)]">
        <SectionDecor variant="d" />
        <div className={CONTAINER}>
          <h2 className={`${H2} mb-[clamp(28px,3.6vw,48px)] text-center`}>What we hold to</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[clamp(16px,2vw,24px)]">
            {VALUES.map((v) => (
              <div key={v.title} className="flex flex-col gap-3.5 rounded-xl bg-ka-sand px-7 py-8">
                <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-ka-cream text-ka-green">{v.icon}</span>
                <span className="font-display text-[26px] font-semibold text-ka-green">{v.title}</span>
                <span className="text-[15px] leading-[1.7] text-ka-body">{v.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real photos only - the row stays hidden until the store uploads its own. */}
      {craft.items.length > 0 && (
        <>
          <Wave from="#FAF6EE" to="#E8F0E4" shape="b" />
          <section className="relative isolate overflow-clip bg-ka-mint py-[clamp(56px,7vw,112px)]">
            <SectionDecor variant="a" />
            <div className={CONTAINER}>
              <h2 className={`${H2} mb-[clamp(28px,3.6vw,48px)] text-balance break-words`}>{craft.heading}</h2>
              {/* Fixed columns, so one or two photos keep the same size instead of stretching across the row. */}
              <div className="grid grid-cols-1 gap-[clamp(12px,1.8vw,20px)] xs:grid-cols-2 ka:grid-cols-3">
                {craft.items.map((item) => (
                  <figure key={item.image.publicId} className="m-0 flex flex-col gap-2.5">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-ka-sand">
                      <Image
                        src={getOptimizedImageUrl(item.image.url, 680, 850)}
                        alt={item.caption}
                        fill
                        sizes="(max-width: 560px) 100vw, (max-width: 820px) 50vw, 420px"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="break-words text-[14.5px] font-semibold text-ka-green">{item.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
          <Wave from="#E8F0E4" to="#FAF6EE" />
        </>
      )}

      <section className="relative isolate overflow-clip pt-[clamp(40px,5vw,72px)]">
        <SectionDecor variant="b" />
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-[18px] px-[clamp(20px,4vw,56px)] text-center">
          <h2 className={H2}>Bring Kerala Ayurveda home</h2>
          <p className="m-0 text-base leading-[1.6] text-ka-body">Explore our range of Ayurvedic oils, face packs and more.</p>
          <Link href="/products" className="flex h-[52px] items-center whitespace-nowrap rounded-lg bg-ka-green px-8 text-[15px] font-semibold text-ka-cream hover:bg-ka-green-dark">
            Shop the Collection
          </Link>
        </div>
      </section>
    </>
  );
}
