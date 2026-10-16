"use client";

import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useQuickAddToCart } from "@/modules/cart/hooks/useCart";
import { useToggleWishlist, useWishlistIds } from "@/modules/wishlist/hooks/useWishlist";
import { HeartIcon, LeafIcon } from "@/modules/storefront-shell/components/icons";
import type { UserProductListItem } from "../../types/storefront-product.type";
import { PRODUCT_TYPE_LABELS } from "../../constants/product-options";
import PriceTag from "./PriceTag";

/** Storefront product tile (design's "Product Card"): photo + wishlist heart, badge, serif name, short description, price/MRP/discount and an Add to Cart pill. Sizes itself off its own width via a container query, so it reads well in 2-up phone grids and 4-up desktop grids alike. */
export default function ProductCard({ product, subtitle = product.shortDescription }: { product: UserProductListItem; subtitle?: string }) {
  const { data: wishIds } = useWishlistIds();
  const { mutate: toggleWish, isPending: toggling } = useToggleWishlist();
  const { quickAdd, pendingProductId } = useQuickAddToCart();

  const href = `/products/${product.slug}`;
  const wished = wishIds?.data?.includes(product.id) ?? false;
  const adding = pendingProductId === product.id;

  return (
    <div className="@container flex h-full flex-col rounded-3xl bg-white p-2.5 font-body text-ka-ink shadow-[0_18px_40px_-28px_rgba(31,77,58,.45)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_26px_50px_-28px_rgba(31,77,58,.55)]">
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-ka-sand">
        <Link href={href} aria-label={product.name} className="absolute inset-0 block">
          {product.image ? (
            <Image
              src={getOptimizedImageUrl(product.image, 600)}
              alt={product.name}
              fill
              sizes="(max-width: 820px) 50vw, 300px"
              className="object-cover"
            />
          ) : (
            <span className="grid h-full place-items-center text-ka-green/30">
              <LeafIcon size={48} strokeWidth={1.1} />
            </span>
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_40%,rgba(169,196,160,.35)_100%)]" />
          {product.badge && (
            <span className="absolute left-2 top-2 rounded-full bg-ka-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.08em] text-ka-green">{product.badge}</span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => toggleWish({ productId: product.id, name: product.name })}
          disabled={toggling}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wished}
          className={`absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white shadow-[0_4px_12px_-6px_rgba(31,77,58,.5)] ${wished ? "text-ka-gold" : "text-ka-green"}`}
        >
          <HeartIcon size={17} strokeWidth={1.7} filled={wished} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-[clamp(4px,1.4cqw,8px)] pb-[clamp(4px,1.4cqw,8px)] pt-[clamp(12px,3.4cqw,16px)]">
        {product.type && <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-ka-muted">{PRODUCT_TYPE_LABELS[product.type]}</span>}
        <Link href={href} className="text-balance font-display text-[clamp(18px,4.8cqw,23px)] font-bold leading-[1.1] text-ka-green">
          {product.name}
        </Link>
        {subtitle && <span className="line-clamp-2 text-[clamp(12.5px,3.4cqw,13.5px)] leading-normal text-ka-grey">{subtitle}</span>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <span className="flex min-w-0 flex-col gap-1">
            <PriceTag
              price={product.price}
              mrp={product.mrp}
              discountPercent={product.discountPercent}
              className="text-[clamp(16px,4.4cqw,20px)] font-bold text-ka-green"
            />
            {product.variantCount > 1 && <span className="text-[11.5px] text-ka-muted">{product.variantCount} sizes</span>}
          </span>
          <button
            type="button"
            onClick={() => quickAdd(product.id, product.name)}
            disabled={adding}
            className="h-[clamp(38px,10cqw,44px)] min-w-0 whitespace-nowrap rounded-full bg-ka-green px-[clamp(12px,3.4cqw,20px)] text-[clamp(12px,3.2cqw,14px)] font-semibold text-ka-cream hover:bg-ka-green-dark disabled:opacity-60"
          >
            {adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
