"use client";

import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/format";
import { useQuickAddToCart } from "@/modules/cart/hooks/useCart";
import { showStoreToast } from "@/modules/storefront-shell/components/StoreToast";
import { LeafIcon } from "@/modules/storefront-shell/components/icons";
import type { BlogProduct } from "@/modules/blog/types/blog.type";

/** "From our range" - the products the admin picked for this spot in the article, each with a one-tap Add. */
export function ArticleProducts({ products }: { products: BlogProduct[] }) {
  const { quickAdd, pendingProductId } = useQuickAddToCart();
  if (products.length === 0) return null;

  return (
    <div className="my-2.5 flex flex-col gap-3.5 rounded-xl bg-ka-mint p-[22px]">
      <span className="text-xs font-bold tracking-[.16em] text-ka-green">FROM OUR RANGE</span>
      {products.map((p) => (
        <div key={p.id} className="flex items-center gap-3.5 rounded-[10px] bg-ka-cream p-3">
          <Link href={`/products/${p.slug}`} aria-label={p.name} className="relative h-16 w-16 flex-none overflow-hidden rounded-lg bg-ka-sand">
            {p.image ? (
              <Image src={getOptimizedImageUrl(p.image, 140)} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <span className="grid h-full place-items-center text-ka-green/30">
                <LeafIcon size={24} />
              </span>
            )}
          </Link>
          <span className="flex min-w-0 flex-1 flex-col leading-[1.35]">
            <Link href={`/products/${p.slug}`} className="break-words font-display text-xl font-semibold text-ka-green">
              {p.name}
            </Link>
            <span className="text-sm font-bold text-ka-gold">{formatCurrency(p.price)}</span>
          </span>
          <button
            type="button"
            onClick={() => quickAdd(p.id, p.name)}
            disabled={pendingProductId === p.id}
            className="h-10 flex-none rounded-lg bg-ka-green px-4 text-[13px] font-semibold text-ka-cream disabled:opacity-60"
          >
            {pendingProductId === p.id ? "Adding…" : "Add"}
          </button>
        </div>
      ))}
    </div>
  );
}

/** Share row at the foot of an article; links are built from the live page URL on click. */
export function ArticleShare({ title }: { title: string }) {
  const pillClass = "inline-flex h-10 items-center rounded-full border border-ka-sage bg-transparent px-4 text-[13.5px] font-semibold text-ka-green hover:bg-ka-mint";

  const open = (build: (url: string, text: string) => string) => {
    const url = window.location.href;
    window.open(build(encodeURIComponent(url), encodeURIComponent(title)), "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showStoreToast({ title: "Link copied", detail: title });
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  return (
    <div className="mt-[18px] flex flex-wrap items-center gap-2.5 border-t border-ka-gold/50 pt-6">
      <span className="mr-1.5 text-sm font-semibold text-ka-green">Share</span>
      <button type="button" className={pillClass} onClick={() => open((u, t) => `https://wa.me/?text=${t}%20${u}`)}>
        WhatsApp
      </button>
      <button type="button" className={pillClass} onClick={() => open((u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`)}>
        Facebook
      </button>
      <button type="button" className={pillClass} onClick={() => open((u, t) => `https://x.com/intent/post?url=${u}&text=${t}`)}>
        X
      </button>
      <button type="button" className={pillClass} onClick={copy}>
        Copy link
      </button>
    </div>
  );
}
