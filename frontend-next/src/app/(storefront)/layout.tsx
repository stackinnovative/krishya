import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import Navbar from "@/modules/storefront-shell/components/Navbar";
import Footer from "@/modules/storefront-shell/components/Footer";
import MaintenanceScreen from "@/modules/storefront-shell/components/MaintenanceScreen";
import MobileTabBar, { TabBarSpacer } from "@/modules/storefront-shell/components/MobileTabBar";
import MenuDrawer from "@/modules/storefront-shell/components/MenuDrawer";
import SearchOverlay from "@/modules/storefront-shell/components/SearchOverlay";
import StorefrontUIProvider from "@/modules/storefront-shell/components/StorefrontUIProvider";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getSettings } from "@/modules/settings/server";
import type { GetSettingsResponse } from "@/modules/settings/types/settings.type";
import { toStoreInfo } from "@/modules/settings/store-info";
import { settingsKeys } from "@/shared/query-keys";
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
  const store = toStoreInfo(settings);
  const themeClass = `user-theme ${cormorant.variable} ${dmSans.variable}`;

  if (settings?.maintenance) {
    return (
      <div className={themeClass}>
        <MaintenanceScreen storeName={store.storeName} email={store.email} />
      </div>
    );
  }

  // Seed the client-side settings query with this request's settings so the
  // header, drawer, hero, cart and contact details render the admin's store
  // name/logo/contact info in the first HTML - no flash of fallback values.
  const queryClient = new QueryClient();
  if (settings) queryClient.setQueryData<GetSettingsResponse>(settingsKeys.all, { success: true, message: "", data: settings });

  return (
    <div className={themeClass}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <StorefrontUIProvider>
          <Navbar />
          <main className="w-full flex-1">{children}</main>
          <Footer />
          <TabBarSpacer />
          <MobileTabBar />
          <MenuDrawer />
          <SearchOverlay />
        </StorefrontUIProvider>
      </HydrationBoundary>
    </div>
  );
}
