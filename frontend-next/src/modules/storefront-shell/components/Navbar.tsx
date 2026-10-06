"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingBag, Heart } from "lucide-react";
import { useCartCount } from "@/modules/cart/hooks/useCart";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

const LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/#about", label: "About" },
];

const DEFAULT_STORE_NAME = "Artspace";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: count } = useCartCount();
  const { data: settingsRes } = useSettings();
  const settings = settingsRes?.data;
  const storeName = settings?.storeName || DEFAULT_STORE_NAME;

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center" aria-label={storeName}>
          {settings?.logo?.url ? (
            <span className="relative block h-11 w-11 overflow-hidden rounded-xl">
              <Image
                src={getOptimizedImageUrl(settings.logo.url, 88, 88)}
                alt={storeName}
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </span>
          ) : (
            <span className="font-serif text-xl font-semibold" style={{ color: "var(--accent-strong)" }}>
              {storeName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium hover:opacity-70">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/wishlist" aria-label="Wishlist">
            <Heart size={20} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingBag size={20} />
            {!!count?.data && (
              <span
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--accent)" }}
              >
                {count.data}
              </span>
            )}
          </Link>
          <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t px-4 py-3 md:hidden" style={{ borderColor: "var(--border)" }}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 text-sm font-medium">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
