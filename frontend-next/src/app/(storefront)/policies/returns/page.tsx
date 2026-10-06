import type { Metadata } from "next";
import { MessageCircle, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/contact";
import { POLICY_ICON_MAP } from "@/modules/settings/constants/policy-icons";
import PolicyBody from "@/modules/settings/components/PolicyBody";
import { getSettings } from "@/modules/settings/server";

export const metadata: Metadata = {
  title: "Return & Replacement Policy",
  description: "Our return and replacement policy - what's covered, timelines, and how to request a replacement.",
};

type PolicyItem = { icon: LucideIcon; title: string; content: React.ReactNode };

export default async function ReturnPolicyPage() {
  const settings = await getSettings();
  const sections = settings?.refundReturnSections ?? [];
  const policyItems: PolicyItem[] = sections.map((s) => ({
    icon: POLICY_ICON_MAP[s.icon] ?? Package,
    title: s.heading,
    content: <PolicyBody text={s.description} />,
  }));

  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-[800px] px-4 md:px-6">
        <div className="animate-fade-up text-center" style={{ animationDuration: "500ms" }}>
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl md:text-[42px]">Return &amp; Replacement Policy</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed md:text-base" style={{ color: "var(--muted)" }}>
            We want you to love what you receive. Here&apos;s how replacements work if something isn&apos;t right.
          </p>
        </div>

        <div className="mt-12 space-y-5">
          {policyItems.map((item, index) => (
            <PolicyCard key={index} index={index} {...item} />
          ))}
        </div>

        <div
          className="animate-fade-up mt-5 rounded-2xl border p-6 text-center md:p-8"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", animationDuration: "500ms", animationDelay: `${policyItems.length * 60}ms`, animationFillMode: "backwards" }}
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
            <MessageCircle size={20} />
          </div>
          <h2 className="mt-4 font-serif text-lg font-medium md:text-xl">Need Help?</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base" style={{ color: "var(--muted)" }}>
            If you have any questions, please contact our support team. We&apos;re happy to help.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition hover:text-white"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            <MessageCircle size={16} />
            Contact Us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

function PolicyCard({ icon: Icon, title, content, index }: PolicyItem & { index: number }) {
  return (
    <article
      className="animate-fade-up flex gap-4 rounded-2xl border p-6 shadow-[0_10px_26px_-16px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-16px_rgba(0,0,0,0.16)] md:p-7"
      style={{ background: "var(--card)", borderColor: "var(--border)", animationDuration: "500ms", animationDelay: `${index * 60}ms`, animationFillMode: "backwards" }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
        style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <h2 className="font-serif text-base font-medium md:text-lg">{title}</h2>
        <div className="mt-2 text-sm leading-relaxed md:text-[15px]" style={{ color: "var(--muted)" }}>
          {content}
        </div>
      </div>
    </article>
  );
}
