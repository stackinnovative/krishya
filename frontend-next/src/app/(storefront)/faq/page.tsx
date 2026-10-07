import type { Metadata } from "next";
import { Eyebrow, SectionDecor } from "@/modules/storefront-shell/components/decor";
import WhatsAppCta from "@/modules/storefront-shell/components/WhatsAppCta";
import FaqAccordion from "@/modules/storefront-content/components/FaqAccordion";
import { FAQ_GROUPS } from "@/modules/storefront-content/constants/faqs";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about orders, delivery, payments, products and returns at Krishay Ayurveda.",
};

export default function FaqPage() {
  return (
    <>
      <section className="relative isolate mx-auto max-w-[900px] overflow-clip px-[clamp(20px,4vw,56px)] pt-[clamp(40px,5vw,72px)]">
        <SectionDecor variant="a" />
        <div className="mb-[clamp(32px,4vw,56px)] flex flex-col items-center gap-3.5 text-center">
          <Eyebrow centered>Help Centre</Eyebrow>
          <h1 className="m-0 font-display text-[clamp(40px,4.6vw,64px)] font-medium leading-[1.05] text-ka-green">Frequently asked questions</h1>
          <p className="m-0 text-base text-ka-body">Answers about orders, payments, products and returns.</p>
        </div>
        <div className="flex flex-col gap-[clamp(36px,4vw,56px)]">
          {FAQ_GROUPS.map((g, gi) => (
            <div key={g.group} className="flex flex-col">
              <h2 className="m-0 mb-2 font-display text-[clamp(26px,2.6vw,32px)] font-semibold text-ka-green">{g.group}</h2>
              <div className="border-t border-ka-gold/55">
                <FaqAccordion items={g.items} defaultOpen={gi === 0 ? 0 : undefined} ruleClass="border-ka-green/15" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <WhatsAppCta />
    </>
  );
}
