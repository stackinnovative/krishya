import type { Metadata } from "next";
import { getSettings } from "@/modules/settings/server";
import PolicyLayout from "@/modules/storefront-content/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for shopping with Krishay Ayurveda.",
};

export default async function TermsPage() {
  const settings = await getSettings();
  return <PolicyLayout policy="terms" email={settings?.email} />;
}
