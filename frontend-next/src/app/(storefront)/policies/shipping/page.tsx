import type { Metadata } from "next";
import { getSettings } from "@/modules/settings/server";
import PolicyLayout from "@/modules/storefront-content/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Where we deliver, dispatch and delivery times, and delivery charges.",
};

export default async function ShippingPolicyPage() {
  const settings = await getSettings();
  return <PolicyLayout policy="shipping" email={settings?.email} />;
}
