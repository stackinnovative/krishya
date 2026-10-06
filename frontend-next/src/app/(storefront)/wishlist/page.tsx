"use client";

import Link from "next/link";
import { useWishlist } from "@/modules/wishlist/hooks/useWishlist";
import ProductCard from "@/modules/products/components/storefront/ProductCard";

export default function WishlistPage() {
  const { data, isLoading } = useWishlist();
  const items = data?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-serif text-3xl font-semibold">Wishlist</h1>
      {isLoading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <p style={{ color: "var(--muted)" }}>Your wishlist is empty.</p>
          <Link href="/products" className="mt-4 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: "var(--accent)" }}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
