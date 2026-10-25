"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/format";
import { useProductSearch } from "@/modules/products/hooks/useStorefrontProducts";
import { useStorefrontUI } from "./StorefrontUIProvider";
import { CloseIcon, LeafIcon, SearchIcon } from "./icons";

const POPULAR_SEARCHES = ["Hair oil", "Skincare oil", "Face pack", "Massage oil"];
const DEBOUNCE_MS = 250;

/** Drop-down product search opened from the header search button. Enter (or "See all results") hands the query to the Shop page. */
export default function SearchOverlay() {
  const { overlay, close } = useStorefrontUI();
  if (overlay !== "search") return null;
  return <SearchPanel onClose={close} />;
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = useProductSearch(debounced);
  const results = debounced ? (data?.data ?? []) : [];
  const trimmed = query.trim();

  const goToShop = () => {
    if (!trimmed) return;
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Search products">
      <div onClick={onClose} className="animate-ka-fade absolute inset-0 bg-[rgba(20,35,27,.45)]" />
      <div className="animate-ka-fade relative max-h-[100dvh] overflow-y-auto bg-ka-cream shadow-[0_30px_60px_-30px_rgba(0,0,0,.4)]">
        <div className="mx-auto max-w-[880px] px-[clamp(16px,4vw,40px)] pb-8 pt-6">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              goToShop();
            }}
            className="flex items-center gap-3 border-b-[1.5px] border-ka-green pb-2.5"
          >
            <SearchIcon size={22} className="flex-none text-ka-green" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search oils, face packs, hair care…"
              aria-label="Search products"
              enterKeyHint="search"
              className="min-w-0 flex-1 border-none bg-transparent py-1.5 font-display text-[clamp(22px,3vw,30px)] text-ka-green outline-none placeholder:text-ka-green/45"
            />
            <button type="button" onClick={onClose} aria-label="Close search" className="grid h-11 w-11 flex-none place-items-center rounded-full bg-ka-mint text-ka-green">
              <CloseIcon size={18} />
            </button>
          </form>

          {!trimmed ? (
            <div className="mt-[18px] flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[13px] text-ka-muted">Popular:</span>
              {POPULAR_SEARCHES.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setQuery(label)}
                  className="h-[34px] rounded-full border border-ka-sage bg-white px-3.5 text-[13px] text-ka-green hover:bg-ka-mint"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-2.5 flex flex-col">
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3.5 border-b border-ka-gold/30 py-3 hover:bg-[#F3EEE2]"
                >
                  <span className="relative h-[52px] w-[52px] flex-none overflow-hidden rounded-lg bg-ka-sand">
                    {p.image ? (
                      <Image src={getOptimizedImageUrl(p.image, 120)} alt="" fill sizes="52px" className="object-cover" />
                    ) : (
                      <span className="grid h-full place-items-center text-ka-green/30">
                        <LeafIcon size={22} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-display text-xl font-semibold text-ka-green">{p.name}</span>
                  <span className="font-display text-xl font-bold text-ka-gold">{formatCurrency(p.price)}</span>
                </Link>
              ))}
              {debounced && !isFetching && results.length === 0 && (
                <p className="mt-[18px] text-[15px] text-ka-body">
                  No products match &ldquo;{debounced}&rdquo;. Try &ldquo;oil&rdquo;, &ldquo;hair&rdquo; or &ldquo;digestion&rdquo;.
                </p>
              )}
              <button
                type="button"
                onClick={goToShop}
                className="mt-[18px] self-start border-b border-ka-gold pb-[3px] text-[14.5px] font-semibold text-ka-green"
              >
                See all results in Shop
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
