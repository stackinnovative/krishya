import type { Metadata } from "next";
import { getSettings, getStoreInfo } from "@/modules/settings/server";
import PolicyLayout from "@/modules/storefront-content/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy",
  description: "Our returns and refunds policy - eligibility, damaged items, and how refunds are processed.",
};

/** Sections are admin-editable (Business Settings → Refund & Return); the design's copy shows until they're filled in. */
export default async function ReturnPolicyPage() {
  const settings = await getSettings();
  const sections = (settings?.refundReturnSections ?? []).map((s) => ({ heading: s.heading, body: s.description }));
  return <PolicyLayout policy="returns" sections={sections} store={await getStoreInfo()} />;
}
