import type { Metadata } from "next";
import { Eyebrow, SectionDecor } from "@/modules/storefront-shell/components/decor";
import BlogList from "@/modules/storefront-content/components/BlogList";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes on Ayurvedic living - seasonal care, daily routines and the herbs of Kerala.",
};

export default function BlogPage() {
  return (
    <section className="relative isolate mx-auto max-w-[1280px] overflow-clip px-[clamp(20px,4vw,56px)] pb-[clamp(56px,7vw,104px)] pt-[clamp(40px,5vw,72px)]">
      <SectionDecor variant="c" />
      <div className="mb-[clamp(28px,3.6vw,48px)] flex flex-col gap-3">
        <Eyebrow>Journal</Eyebrow>
        <h1 className="m-0 font-display text-[clamp(40px,4.6vw,64px)] font-medium leading-[1.05] text-ka-green">Notes on Ayurvedic living</h1>
      </div>
      <BlogList />
    </section>
  );
}
