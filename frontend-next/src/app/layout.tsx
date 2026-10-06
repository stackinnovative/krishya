import type { Metadata } from "next";
import Providers from "./providers";
import { getSettings } from "@/modules/settings/server";
import "./globals.css";

const DEFAULT_STORE_NAME = "Artspace";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const storeName = settings?.storeName || DEFAULT_STORE_NAME;
  return {
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: "Handcrafted tote bags, flower bouquets, and curated gifts, delivering across India.",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
