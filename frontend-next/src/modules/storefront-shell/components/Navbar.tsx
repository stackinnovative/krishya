"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartCount } from "@/modules/cart/hooks/useCart";
import { useWishlistIds } from "@/modules/wishlist/hooks/useWishlist";
import { NAV_LINKS, MOBILE_ROOT_PATHS, getBackHref, isNavActive } from "../navigation";
import { useStorefrontUI } from "./StorefrontUIProvider";
import BrandLogo from "./BrandLogo";
import { BagIcon, ChevronLeftIcon, HeartIcon, SearchIcon } from "./icons";

function CountBadge({ count, className = "" }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span className={`absolute grid h-[18px] min-w-[18px] place-items-center rounded-[9px] bg-ka-gold px-[5px] text-[10.5px] font-bold text-ka-on-gold ${className}`}>
      {count}
    </span>
  );
}

/**
 * Sticky storefront header. On the home page it starts transparent and
 * overlaps the hero (the hero's top padding reserves its height), then turns
 * into the frosted cream bar once the page scrolls - everywhere else it's
 * always the frosted bar.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { openSearch } = useStorefrontUI();
  const { data: cartCount } = useCartCount();
  const { data: wishIds } = useWishlistIds();
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";
  const showBack = !MOBILE_ROOT_PATHS.includes(pathname);
  const cartItems = cartCount?.data ?? 0;
  const wishItems = wishIds?.data?.length ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !isHome;

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-[background,box-shadow,border-color] duration-300 ${isHome ? "-mb-[clamp(60px,6vw,84px)]" : ""} ${
        solid
          ? "border-ka-gold/30 bg-ka-cream/95 shadow-[0_6px_18px_-16px_rgba(31,77,58,.5)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[clamp(60px,6vw,84px)] max-w-[1280px] items-center gap-[clamp(10px,2vw,32px)] px-[clamp(16px,4vw,56px)]">
        {showBack && (
          <Link
            href={getBackHref(pathname)}
            aria-label="Back"
            className="grid h-10 w-10 flex-none place-items-center rounded-full bg-ka-sand text-ka-green ka:hidden"
          >
            <ChevronLeftIcon size={20} strokeWidth={1.8} />
          </Link>
        )}

        <Link href="/" aria-label="Krishay Ayurveda home" className="flex-none">
          <BrandLogo />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 justify-center gap-[clamp(18px,2.6vw,40px)] ka:flex">
          {NAV_LINKS.map((link) => {
            const active = isNavActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-[1.5px] py-2 text-[15px] font-medium transition-colors hover:border-ka-sage hover:text-ka-green ${
                  active ? "border-ka-gold text-ka-green" : "border-transparent text-ka-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search"
            className="grid h-10 w-10 place-items-center rounded-full bg-ka-sand text-ka-green hover:bg-ka-mint ka:h-11 ka:w-11 ka:bg-transparent"
          >
            <SearchIcon size={21} />
          </button>

          <Link href="/wishlist" aria-label={`Wishlist${wishItems ? `, ${wishItems} saved` : ""}`} className="relative hidden h-11 w-11 place-items-center rounded-full text-ka-green hover:bg-ka-mint ka:grid">
            <HeartIcon size={21} />
            <CountBadge count={wishItems} className="right-0.5 top-1" />
          </Link>
          <Link href="/cart" aria-label={`Cart${cartItems ? `, ${cartItems} items` : ""}`} className="relative hidden h-11 w-11 place-items-center rounded-full text-ka-green hover:bg-ka-mint ka:grid">
            <BagIcon size={22} />
            <CountBadge count={cartItems} className="right-0.5 top-1" />
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart${cartItems ? `, ${cartItems} items` : ""}`}
            className="relative ml-1.5 grid h-11 w-11 place-items-center rounded-full bg-ka-green text-ka-cream ka:hidden"
          >
            <BagIcon size={20} strokeWidth={1.7} />
            <CountBadge count={cartItems} className="-right-0.5 -top-0.5 border-[1.5px] border-ka-cream" />
          </Link>
        </div>
      </div>
    </header>
  );
}
