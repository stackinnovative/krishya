import Link from "next/link";
import Image from "next/image";
import { env } from "@/lib/env";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { getSettings } from "@/modules/settings/server";

const DEFAULT_STORE_NAME = "Artspace";

export default async function Footer() {
  const settings = await getSettings();
  const storeName = settings?.storeName || DEFAULT_STORE_NAME;
  // Business Settings' contact fields are the source of truth once set - the
  // env vars remain a fallback for stores that haven't filled them in yet.
  const contactEmail = settings?.email || env.contactEmail;
  const contactPhone = settings?.phone || env.contactPhone;

  return (
    <footer className="mt-16 border-t" style={{ background: "var(--footer-bg)", borderColor: "var(--border)" }}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          {settings?.logo?.url ? (
            <span className="relative block h-10 w-10 overflow-hidden rounded-xl">
              <Image
                src={getOptimizedImageUrl(settings.logo.url, 80, 80)}
                alt={storeName}
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
          ) : (
            <div className="font-serif text-lg font-semibold" style={{ color: "var(--accent-strong)" }}>
              {storeName}
            </div>
          )}
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Handcrafted tote bags, flower bouquets, and curated gifts, delivering across India.
          </p>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold">Shop</div>
          <ul className="flex flex-col gap-1.5" style={{ color: "var(--muted)" }}>
            <li><Link href="/products">All products</Link></li>
            <li><Link href="/cart">Cart</Link></li>
            <li><Link href="/wishlist">Wishlist</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold">Support</div>
          <ul className="flex flex-col gap-1.5" style={{ color: "var(--muted)" }}>
            <li><Link href="/policies/returns">Returns policy</Link></li>
            <li><Link href="/policies/privacy">Privacy policy</Link></li>
            <li><Link href="/policies/terms">Terms &amp; conditions</Link></li>
            {contactEmail && <li>{contactEmail}</li>}
            {contactPhone && <li>{contactPhone}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
