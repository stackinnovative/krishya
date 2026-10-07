"use client";

import Link from "next/link";
import { STORE_TAGLINE } from "@/lib/contact";
import { useCartCount } from "@/modules/cart/hooks/useCart";
import { useWishlistIds } from "@/modules/wishlist/hooks/useWishlist";
import { NAV_LINKS } from "../navigation";
import { useStoreContact } from "../hooks/useStoreContact";
import { useStorefrontUI } from "./StorefrontUIProvider";
import { BrandMark } from "./BrandLogo";
import SocialLinks from "./SocialLinks";
import { ChevronRightIcon, CloseIcon } from "./icons";

/** Left slide-in menu opened from the mobile tab bar's "More". */
export default function MenuDrawer() {
  const { overlay, close } = useStorefrontUI();
  const { data: cartCount } = useCartCount();
  const { data: wishIds } = useWishlistIds();
  const { whatsapp, logoUrl, socialLinks } = useStoreContact();

  if (overlay !== "menu") return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menu">
      <div onClick={close} className="animate-ka-fade absolute inset-0 bg-[rgba(20,35,27,.45)]" />
      <div className="animate-ka-drawer relative flex h-full w-[min(330px,88%)] flex-col overflow-auto bg-ka-cream px-6 pb-7 pt-5">
        <div className="mb-6 flex items-center justify-between">
          <BrandMark logoUrl={logoUrl} size={52} />
          <button type="button" onClick={close} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full bg-ka-mint text-ka-green">
            <CloseIcon size={20} />
          </button>
        </div>

        <nav aria-label="Menu" className="flex flex-col">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="flex items-center justify-between border-b border-ka-gold/35 py-3.5 font-display text-[27px] font-medium text-ka-green"
            >
              {link.label}
              <ChevronRightIcon size={18} className="text-ka-sage" />
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex gap-2.5">
          <Link href="/wishlist" onClick={close} className="flex h-[46px] flex-1 items-center justify-center rounded-lg border border-ka-gold text-sm font-semibold text-ka-green">
            Wishlist ({wishIds?.data?.length ?? 0})
          </Link>
          <Link href="/cart" onClick={close} className="flex h-[46px] flex-1 items-center justify-center rounded-lg bg-ka-green text-sm font-semibold text-ka-cream">
            Cart ({cartCount?.data ?? 0})
          </Link>
        </div>
        <a
          href={whatsapp()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex h-[46px] items-center justify-center gap-2 rounded-lg bg-ka-wa text-sm font-semibold text-white"
        >
          Chat on WhatsApp
        </a>
        <SocialLinks links={socialLinks} variant="light" className="mt-5 justify-center" />

        <span className="mt-auto pt-7 font-display text-lg italic text-ka-green">{STORE_TAGLINE}</span>
      </div>
    </div>
  );
}
