import type { Metadata } from "next";
import { getStoreInfo } from "@/modules/settings/server";
import PolicyLayout from "@/modules/storefront-content/components/PolicyLayout";

export async function generateMetadata(): Promise<Metadata> {
  const { storeName } = await getStoreInfo();
  return { title: "Terms & Conditions", description: `Terms and conditions for shopping with ${storeName}.` };
}

export default async function TermsPage() {
  return <PolicyLayout policy="terms" store={await getStoreInfo()} />;
}
