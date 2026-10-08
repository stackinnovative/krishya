import type { Metadata } from "next";
import { getStoreInfo } from "@/modules/settings/server";
import PolicyLayout from "@/modules/storefront-content/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Where we deliver, dispatch and delivery times, and delivery charges.",
};

export default async function ShippingPolicyPage() {
  return <PolicyLayout policy="shipping" store={await getStoreInfo()} />;
}
