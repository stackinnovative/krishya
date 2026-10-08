import type { Metadata } from "next";
import { getStoreInfo } from "@/modules/settings/server";
import Link from "next/link";
import Image from "next/image";
import { CONTAINER, Eyebrow, SectionDecor, Wave } from "@/modules/storefront-shell/components/decor";
import { HeartIcon, MortarIcon, SproutIcon } from "@/modules/storefront-shell/components/icons";
import { ArticleImage } from "@/modules/storefront-content/components/ArticleCard";

export async function generateMetadata(): Promise<Metadata> {
  const { storeName } = await getStoreInfo();
  return {
    title: "Our Story",
    description: `Rooted in Ayurveda, crafted for today - the story of ${storeName} and the House of Cochin Arya Vaidyasala.`,
  };
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

const CRAFT = [
  { label: "Sorting herbs by hand", tone: "#FAF6EE" },
  { label: "Slow-cooking in bronze urulis", tone: "#EFE6D8" },
  { label: "Grinding churnams on stone", tone: "#FAF6EE" },
];

const H2 = "m-0 font-display text-[clamp(32px,3.4vw,48px)] font-medium leading-[1.1] text-ka-green";

export default async function AboutPage() {
  const { storeName } = await getStoreInfo();
  return (
    <>
      <section className="relative isolate overflow-clip pb-[clamp(40px,5vw,72px)] pt-[clamp(48px,6vw,96px)]">
        <SectionDecor variant="a" />
        <div className="mx-auto flex max-w-[880px] flex-col items-center gap-[18px] px-[clamp(20px,4vw,56px)] text-center">
          <Eyebrow centered>Our Story</Eyebrow>
          <h1 className="m-0 text-balance font-display text-[clamp(42px,5vw,72px)] font-medium leading-[1.04] text-ka-green">Rooted in Ayurveda, crafted for today</h1>
          <p className="m-0 font-display text-[clamp(20px,1.7vw,24px)] italic text-ka-green">From the House of Cochin Arya Vaidyasala</p>
        </div>
        <div className={`${CONTAINER} mt-[clamp(36px,4.4vw,64px)]`}>
          <div className="relative h-[clamp(260px,36vw,520px)] overflow-hidden rounded-xl bg-ka-mint">
            <Image src="/images/hero-oil-herbs.jpg" alt="Herbal oil, turmeric and sesame prepared for a classical formulation" fill priority sizes="100vw" className="object-cover object-[50%_60%]" />
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-clip pb-[clamp(56px,7vw,112px)]">
        <SectionDecor variant="b" />
        <div className={`${CONTAINER} grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(28px,6vw,96px)]`}>
          <div className="flex flex-col gap-[18px]">
            <h2 className={H2}>A house of healers</h2>
            <div className="flex max-w-[360px] items-center gap-5 border-y border-ka-gold/55 py-[18px]">
              <span className="font-display text-[72px] font-medium leading-[.9] text-ka-gold">75+</span>
              <span className="text-[15px] font-medium leading-normal text-ka-green">
                years of Ayurvedic
                <br />
                tradition in Kerala
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-[18px] text-[16.5px] leading-[1.8] text-[#3F423B]">
            <p className="m-0 text-pretty">
              Cochin Arya Vaidyasala began as a small family dispensary in Kochi, where Vaidyas prepared medicines by hand for the people of the neighbourhood. Recipes were
              learned from the classical texts and passed from teacher to student, together with the patience each preparation needs.
            </p>
            <p className="m-0 text-pretty">
              Over the decades the Vaidyasala grew, but its way of working stayed the same: herbs gathered in their season, oils cooked slowly over a low fire, and every
              batch checked by experienced hands before it leaves the kitchen.
            </p>
            <p className="m-0 text-pretty">
              {storeName} is our way of sharing these preparations with families across India, with clear information, honest descriptions and the same care our elders put
              into every bottle.
            </p>
          </div>
        </div>
      </section>

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

      <Wave from="#FAF6EE" to="#E8F0E4" shape="b" />
      <section className="relative isolate overflow-clip bg-ka-mint py-[clamp(56px,7vw,112px)]">
        <SectionDecor variant="a" />
        <div className={CONTAINER}>
          <h2 className={`${H2} mb-[clamp(28px,3.6vw,48px)]`}>The traditional way</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-[clamp(12px,1.8vw,20px)]">
            {CRAFT.map((c) => (
              <div key={c.label} className="flex flex-col gap-2.5">
                <ArticleImage tone={c.tone} className="aspect-[4/5]" />
                <span className="text-[14.5px] font-semibold text-ka-green">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Wave from="#E8F0E4" to="#FAF6EE" />

      <section className="relative isolate overflow-clip pt-[clamp(40px,5vw,72px)]">
        <SectionDecor variant="b" />
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-[18px] px-[clamp(20px,4vw,56px)] text-center">
          <h2 className={H2}>Bring Kerala Ayurveda home</h2>
          <p className="m-0 text-base leading-[1.6] text-ka-body">Explore our range of thailams, churnams, arishtams and more.</p>
          <Link href="/products" className="flex h-[52px] items-center whitespace-nowrap rounded-lg bg-ka-green px-8 text-[15px] font-semibold text-ka-cream hover:bg-ka-green-dark">
            Shop the Collection
          </Link>
        </div>
      </section>
    </>
  );
}
