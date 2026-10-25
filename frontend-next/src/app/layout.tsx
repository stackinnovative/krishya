import type { Metadata } from "next";
import Providers from "./providers";
import { getSettings } from "@/modules/settings/server";
import { DEFAULT_STORE_NAME } from "@/lib/contact";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const storeName = settings?.storeName || DEFAULT_STORE_NAME;
  return {
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: "Ayurvedic wellness from the house of Cochin Arya Vaidyasala - skincare oils, hair oils and face packs, delivered across India.",
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
