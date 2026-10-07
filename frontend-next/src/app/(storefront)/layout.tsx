import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import Navbar from "@/modules/storefront-shell/components/Navbar";
import Footer from "@/modules/storefront-shell/components/Footer";
import MaintenanceScreen from "@/modules/storefront-shell/components/MaintenanceScreen";
import MobileTabBar, { TabBarSpacer } from "@/modules/storefront-shell/components/MobileTabBar";
import MenuDrawer from "@/modules/storefront-shell/components/MenuDrawer";
import SearchOverlay from "@/modules/storefront-shell/components/SearchOverlay";
import StorefrontUIProvider from "@/modules/storefront-shell/components/StorefrontUIProvider";
import { getSettings } from "@/modules/settings/server";
import "./storefront.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["400", "500", "600", "700"] });

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const themeClass = `user-theme ${cormorant.variable} ${dmSans.variable}`;

  if (settings?.maintenance) {
    return (
      <div className={themeClass}>
        <MaintenanceScreen storeName={settings.storeName} email={settings.email} />
      </div>
    );
  }

  return (
    <div className={themeClass}>
      <StorefrontUIProvider>
        <Navbar />
        <main className="w-full flex-1">{children}</main>
        <Footer />
        <TabBarSpacer />
        <MobileTabBar />
        <MenuDrawer />
        <SearchOverlay />
      </StorefrontUIProvider>
    </div>
  );
}
