import type { Metadata } from "next";
import { Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PolicyBody from "@/modules/settings/components/PolicyBody";
import { POLICY_ICON_MAP } from "@/modules/settings/constants/policy-icons";
import { getSettings } from "@/modules/settings/server";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your personal information.",
};

function PolicySection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full"
          style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}
        >
          <Icon size={16} />
        </div>
        <h2 className="text-base font-medium md:text-lg">{title}</h2>
      </div>
      <div className="space-y-3" style={{ color: "var(--muted)" }}>
        {children}
      </div>
    </div>
  );
}

export default async function PrivacyPolicyPage() {
  const settings = await getSettings();
  const sections = settings?.privacyPolicySections ?? [];

  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="font-serif text-3xl font-semibold">Privacy Policy</h1>

        <div className="mt-10 space-y-10 text-sm leading-relaxed">
          {sections.map((section, i) => (
            <PolicySection key={i} icon={POLICY_ICON_MAP[section.icon] ?? Package} title={section.heading}>
              <PolicyBody text={section.description} />
            </PolicySection>
          ))}
        </div>
      </div>
    </section>
  );
}
