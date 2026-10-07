import Link from "next/link";
import type { StoreInfo } from "@/modules/settings/store-info";
import PolicyBody from "@/modules/settings/components/PolicyBody";
import { POLICY_LINKS } from "@/modules/storefront-shell/navigation";
import { SectionDecor } from "@/modules/storefront-shell/components/decor";
import { getPolicyCopy, POLICY_TITLES, POLICY_UPDATED_ON, type PolicyKey } from "../constants/policies";

type Section = { heading: string; body: string };

/**
 * Shared policy page: sidebar of all four policies (a scrolling pill row on
 * phones) + title + sections. `sections` comes from Business Settings when
 * the admin has written them; delivery charges and the contact email always follow Business Settings; otherwise the design's default copy is used.
 */
export default function PolicyLayout({ policy, sections, store }: { policy: PolicyKey; sections?: Section[]; store: StoreInfo }) {
  const content = sections && sections.length > 0 ? sections : getPolicyCopy(store)[policy].map((s) => ({ heading: s.heading, body: s.body }));
  const activeHref = `/policies/${policy}`;

  return (
    <section className="relative isolate mx-auto flex max-w-[1100px] flex-col gap-[clamp(24px,5vw,72px)] overflow-clip px-[clamp(20px,4vw,56px)] pb-[clamp(56px,7vw,104px)] pt-[clamp(32px,5vw,72px)] ka:flex-row ka:items-start">
      <SectionDecor variant="c" />
      <nav aria-label="Policies" className="flex flex-col gap-1 ka:sticky ka:top-[108px] ka:w-[240px] ka:flex-none">
        <span className="mb-2 text-xs font-bold tracking-[.16em] text-ka-muted">POLICIES</span>
        <div className="no-scrollbar -mx-[clamp(20px,4vw,56px)] flex gap-2 overflow-x-auto px-[clamp(20px,4vw,56px)] ka:mx-0 ka:flex-col ka:gap-1 ka:overflow-visible ka:px-0">
          {POLICY_LINKS.map((l) => {
            const on = l.href === activeHref;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={on ? "page" : undefined}
                className={`flex-none whitespace-nowrap rounded-full border px-4 py-2 text-[14.5px] ka:rounded-none ka:rounded-r-lg ka:border-0 ka:border-l-2 ka:px-3.5 ka:py-2.5 ${
                  on ? "border-ka-gold bg-ka-mint font-semibold text-ka-green" : "border-ka-line font-medium text-ka-body ka:border-transparent"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex min-w-0 max-w-[700px] flex-1 flex-col gap-3.5">
        <h1 className="m-0 font-display text-[clamp(38px,4.4vw,58px)] font-medium leading-[1.05] text-ka-green">{POLICY_TITLES[policy]}</h1>
        <span className="border-b border-ka-gold/50 pb-[18px] text-sm text-ka-muted">Last updated {POLICY_UPDATED_ON}</span>
        {content.map((s, i) => (
          <div key={`${s.heading}-${i}`} className="flex flex-col gap-2 pt-3.5">
            <h2 className="m-0 font-display text-[26px] font-semibold text-ka-green">{s.heading}</h2>
            <div className="flex flex-col gap-3 text-pretty text-[16.5px] leading-[1.8] text-[#3F423B]">
              <PolicyBody text={s.body} />
            </div>
          </div>
        ))}
        <p className="mb-0 mt-6 rounded-[10px] bg-ka-mint p-[18px] text-[14.5px] leading-[1.6] text-ka-green">
          Questions about this policy? Write to{" "}
          <a href={`mailto:${store.email}`} className="font-semibold underline">
            {store.email}
          </a>{" "}
          or{" "}
          <Link href="/contact" className="font-semibold underline">
            chat with us on WhatsApp
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
