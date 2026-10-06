import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import OfflineBanner from "@/modules/admin-shell/components/OfflineBanner";
import { getSettings } from "@/modules/settings/server";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

const DEFAULT_STORE_NAME = "Artspace";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const storeName = settings?.storeName || DEFAULT_STORE_NAME;
  return {
    title: { default: "Admin", template: `%s | ${storeName} Admin` },
    robots: { index: false, follow: false },
  };
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${manrope.className} antialiased`} style={{ color: "#141414" }}>
      <OfflineBanner />
      {children}
    </div>
  );
}
