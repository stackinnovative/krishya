import type { Metadata } from "next";
import { Eyebrow, SectionDecor } from "@/modules/storefront-shell/components/decor";
import WhatsAppCta from "@/modules/storefront-shell/components/WhatsAppCta";
import FaqGroups from "@/modules/storefront-content/components/FaqGroups";
import { getStoreInfo } from "@/modules/settings/server";
import { getFaqGroups } from "@/modules/faq/server";
import { fillFaqAnswer } from "@/modules/faq/constants";

export async function generateMetadata(): Promise<Metadata> {
  const { storeName } = await getStoreInfo();
  return { title: "FAQ", description: `Answers about orders, delivery, payments, products and returns at ${storeName}.` };
}

export default async function FaqPage() {
  const [store, rawGroups] = await Promise.all([getStoreInfo(), getFaqGroups()]);
  // Placeholders like {delivery} become today's Business Settings before anything renders.
  const groups = (rawGroups ?? []).map((g) => ({ ...g, faqs: g.faqs.map((f) => ({ ...f, answer: fillFaqAnswer(f.answer, store) })) }));

  // Lets Google show these questions as rich results.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) => g.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } }))),
  };

  return (
    <>
      <section className="relative isolate mx-auto max-w-[900px] overflow-clip px-[clamp(20px,4vw,56px)] pt-[clamp(40px,5vw,72px)]">
        <SectionDecor variant="a" />
        <div className="mb-[clamp(32px,4vw,56px)] flex flex-col items-center gap-3.5 text-center">
          <Eyebrow centered>Help Centre</Eyebrow>
          <h1 className="m-0 font-display text-[clamp(40px,4.6vw,64px)] font-medium leading-[1.05] text-ka-green">Frequently asked questions</h1>
          <p className="m-0 text-base text-ka-body">Answers about orders, payments, products and returns.</p>
        </div>
        {groups.length > 0 ? (
          <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
            <FaqGroups groups={groups} />
          </>
        ) : (
          <p className="m-0 rounded-2xl bg-ka-sand px-6 py-10 text-center text-[15px] leading-[1.6] text-ka-body">
            {rawGroups === null ? "We couldn't load the questions right now. Please try again in a moment" : "Our answers are being written"} - meanwhile, message us on
            WhatsApp and we&apos;ll help straight away.
          </p>
        )}
      </section>
      <WhatsAppCta />
    </>
  );
}
