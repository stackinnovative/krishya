"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartCount } from "@/modules/cart/hooks/useCart";
import { useWishlistIds } from "@/modules/wishlist/hooks/useWishlist";
import { useStorefrontUI } from "./StorefrontUIProvider";
import { BagIcon, GridIcon, HeartIcon, HomeIcon, MenuIcon } from "./icons";

const MORE_PATHS = ["/about", "/blog", "/faq", "/contact", "/policies"];

function TabInner({ icon, label, active, badge }: { icon: React.ReactNode; label: string; active: boolean; badge?: number }) {
  return (
    <>
      <span className={`relative grid h-[30px] w-11 place-items-center rounded-full ${active ? "bg-ka-mint" : ""}`}>
        {icon}
        {!!badge && (
          <span className="absolute -top-0.5 right-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-[9px] border-[1.5px] border-white bg-ka-gold px-1 text-[10px] font-bold text-ka-on-gold">
            {badge}
          </span>
        )}
      </span>
      {label}
    </>
  );
}

/** Green strip after the footer that keeps its last line clear of the fixed tab bar (taller on product pages, which add a buy bar above it). */
export function TabBarSpacer() {
  const pathname = usePathname();
  return <div aria-hidden="true" className="ka-tabbar-spacer flex-none bg-ka-green" data-tall={pathname.startsWith("/products/")} />;
}

/** Phone-only bottom navigation (Home, Shop, Wishlist, Cart, More) from the design; "More" opens the menu drawer. */
export default function MobileTabBar() {
  const pathname = usePathname();
  const { overlay, openMenu } = useStorefrontUI();
  const { data: cartCount } = useCartCount();
  const { data: wishIds } = useWishlistIds();

  const tabClass = (active: boolean) =>
    `flex h-[54px] flex-col items-center justify-center gap-[3px] text-[11px] ${active ? "font-bold text-ka-green" : "font-medium text-ka-tab"}`;

  const homeActive = pathname === "/";
  const shopActive = pathname === "/products" || pathname.startsWith("/products/");
  const wishActive = pathname === "/wishlist";
  const cartActive = pathname === "/cart" || pathname.startsWith("/checkout");
  const moreActive = overlay === "menu" || MORE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <nav
      aria-label="App navigation"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-ka-sand bg-white/95 px-1 pb-[calc(10px+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md ka:hidden"
    >
      <Link href="/" aria-current={homeActive ? "page" : undefined} className={tabClass(homeActive)}>
        <TabInner icon={<HomeIcon size={22} strokeWidth={1.7} />} label="Home" active={homeActive} />
      </Link>
      <Link href="/products" aria-current={shopActive ? "page" : undefined} className={tabClass(shopActive)}>
        <TabInner icon={<GridIcon size={22} strokeWidth={1.7} />} label="Shop" active={shopActive} />
      </Link>
      <Link href="/wishlist" aria-current={wishActive ? "page" : undefined} className={tabClass(wishActive)}>
        <TabInner icon={<HeartIcon size={22} strokeWidth={1.7} />} label="Wishlist" active={wishActive} badge={wishIds?.data?.length} />
      </Link>
      <Link href="/cart" aria-current={cartActive ? "page" : undefined} className={tabClass(cartActive)}>
        <TabInner icon={<BagIcon size={22} strokeWidth={1.7} />} label="Cart" active={cartActive} badge={cartCount?.data} />
      </Link>
      <button type="button" onClick={openMenu} aria-expanded={overlay === "menu"} className={tabClass(moreActive)}>
        <TabInner icon={<MenuIcon size={22} strokeWidth={1.7} />} label="More" active={moreActive} />
      </button>
    </nav>
  );
}
