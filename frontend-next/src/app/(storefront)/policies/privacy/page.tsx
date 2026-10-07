import type { Metadata } from "next";
import { getSettings } from "@/modules/settings/server";
import PolicyLayout from "@/modules/storefront-content/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your personal information.",
};

/** Sections are admin-editable (Business Settings → Privacy Policy); the design's copy shows until they're filled in. */
export default async function PrivacyPolicyPage() {
  const settings = await getSettings();
  const sections = (settings?.privacyPolicySections ?? []).map((s) => ({ heading: s.heading, body: s.description }));
  return <PolicyLayout policy="privacy" sections={sections} email={settings?.email} />;
}
