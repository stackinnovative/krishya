import type { Metadata } from "next";
import { getStoreInfo } from "@/modules/settings/server";
import { Eyebrow, SectionDecor } from "@/modules/storefront-shell/components/decor";
import ContactPanel from "@/modules/storefront-content/components/ContactPanel";

export async function generateMetadata(): Promise<Metadata> {
  const { storeName } = await getStoreInfo();
  return {
    title: "Contact",
    description: `Questions about a product or an order? Write to ${storeName} or chat with us on WhatsApp.`,
  };
}

export default function ContactPage() {
  return (
    <section className="relative isolate mx-auto max-w-[1280px] overflow-clip px-[clamp(20px,4vw,56px)] pb-[clamp(56px,7vw,104px)] pt-[clamp(40px,5vw,72px)]">
      <SectionDecor variant="b" />
      <div className="mb-[clamp(32px,4vw,56px)] flex max-w-[640px] flex-col gap-3">
        <Eyebrow>Contact</Eyebrow>
        <h1 className="m-0 font-display text-[clamp(40px,4.6vw,64px)] font-medium leading-[1.05] text-ka-green">We&apos;re happy to help</h1>
        <p className="m-0 text-base leading-[1.6] text-ka-body">Questions about a product or an order? Write to us, or chat on WhatsApp for the quickest reply.</p>
      </div>
      <ContactPanel />
    </section>
  );
}
