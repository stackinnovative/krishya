import { Inter, Lora } from "next/font/google";
import Navbar from "@/modules/storefront-shell/components/Navbar";
import Footer from "@/modules/storefront-shell/components/Footer";
import MaintenanceScreen from "@/modules/storefront-shell/components/MaintenanceScreen";
import { getSettings } from "@/modules/settings/server";
import "./storefront.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600", "700"] });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", weight: ["400", "500", "600", "700"] });

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  if (settings?.maintenance) {
    return (
      <div className={`user-theme ${inter.variable} ${lora.variable} font-sans`}>
        <MaintenanceScreen storeName={settings.storeName} email={settings.email} />
      </div>
    );
  }

  return (
    <div className={`user-theme ${inter.variable} ${lora.variable} font-sans`}>
      <Navbar />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}
