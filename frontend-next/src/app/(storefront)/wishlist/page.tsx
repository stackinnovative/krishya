"use client";

import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/format";
import { useQuickAddToCart } from "@/modules/cart/hooks/useCart";
import { useToggleWishlist, useWishlist } from "@/modules/wishlist/hooks/useWishlist";
import { showStoreToast } from "@/modules/storefront-shell/components/StoreToast";
import { SectionDecor } from "@/modules/storefront-shell/components/decor";
import { DeviceIcon, HeartIcon, LeafIcon } from "@/modules/storefront-shell/components/icons";

export default function WishlistPage() {
  const { data, isLoading } = useWishlist();
  const { mutate: toggleWish, isPending: removing, variables: removeVars } = useToggleWishlist();
  const { quickAdd, pendingProductId } = useQuickAddToCart();
  const items = data?.data ?? [];

  const moveToCart = async (id: string, name: string) => {
    const added = await quickAdd(id, name, { silent: true });
    if (!added) return;
    toggleWish({ productId: id, name, silent: true });
    showStoreToast({ title: "Moved to cart", detail: name, showCartLink: true });
  };

  return (
    <section className="relative isolate mx-auto max-w-[1280px] overflow-clip px-4 pb-[clamp(56px,7vw,104px)] pt-[clamp(28px,4.4vw,64px)] sm:px-[clamp(20px,4vw,56px)]">
      <SectionDecor variant="d" />
      <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-display text-[clamp(38px,4.4vw,58px)] font-medium text-ka-green">Wishlist</h1>
          {!isLoading && <span className="text-[15px] text-ka-muted">{`${items.length} saved ${items.length === 1 ? "product" : "products"}`}</span>}
        </div>
        <span className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full bg-ka-mint px-3.5 text-[13px] font-semibold text-ka-green">
          <DeviceIcon size={14} strokeWidth={1.8} />
          Saved on this device · No login needed
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(44%,250px),1fr))] gap-[clamp(12px,2vw,28px)]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-ka-sand" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-ka-mint px-6 py-[clamp(48px,6vw,88px)] text-center">
          <span className="grid h-[84px] w-[84px] place-items-center rounded-full bg-ka-cream text-ka-green">
            <HeartIcon size={34} strokeWidth={1.3} />
          </span>
          <span className="font-display text-[32px] font-medium text-ka-green">Your wishlist is empty</span>
          <span className="max-w-[420px] text-[15px] leading-[1.6] text-ka-body">Tap the heart on any product to save it here for later.</span>
          <Link href="/products" className="mt-2 flex h-[52px] items-center whitespace-nowrap rounded-lg bg-ka-green px-[30px] text-[15px] font-semibold text-ka-cream">
            Explore Products
          </Link>
        </div>
      ) : (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(44%,250px),1fr))] gap-[clamp(12px,2vw,28px)] p-0">
          {items.map((p) => {
            const moving = pendingProductId === p.id;
            const isRemoving = removing && removeVars?.productId === p.id;
            return (
              <li key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-ka-sand bg-white">
                <Link href={`/products/${p.id}`} aria-label={p.name} className="relative block aspect-square bg-ka-sand">
                  {p.image ? (
                    <Image src={getOptimizedImageUrl(p.image, 500)} alt={p.name} fill sizes="(max-width: 820px) 50vw, 300px" className="object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center text-ka-green/30">
                      <LeafIcon size={48} strokeWidth={1.1} />
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
                  <Link href={`/products/${p.id}`} className="font-display text-[clamp(19px,2.2vw,22px)] font-semibold leading-[1.1] text-ka-green">
                    {p.name}
                  </Link>
                  <span className="font-display text-2xl font-bold text-ka-gold">{formatCurrency(p.price)}</span>
                  <button
                    type="button"
                    onClick={() => moveToCart(p.id, p.name)}
                    disabled={moving || isRemoving}
                    className="mt-auto h-[42px] rounded-lg bg-ka-green text-[13.5px] font-semibold text-ka-cream disabled:opacity-60"
                  >
                    {moving ? "Moving…" : "Move to Cart"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWish({ productId: p.id, name: p.name })}
                    disabled={moving || isRemoving}
                    className="h-[38px] text-[13.5px] text-ka-muted hover:text-ka-green"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
