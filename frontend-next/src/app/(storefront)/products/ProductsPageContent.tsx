"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProductList } from "@/modules/products/hooks/useStorefrontProducts";
import { useActiveCategories } from "@/modules/categories/hooks/useStorefrontCategories";
import ProductCard from "@/modules/products/components/storefront/ProductCard";
import ShopFilterSheet from "@/modules/products/components/storefront/ShopFilterSheet";
import SortSelect, { SORT_OPTIONS, type SortValue } from "@/modules/products/components/storefront/SortSelect";
import { SectionDecor, Wave } from "@/modules/storefront-shell/components/decor";
import { CloseIcon, FilterIcon } from "@/modules/storefront-shell/components/icons";

const SORT_VALUES: readonly string[] = SORT_OPTIONS.map((o) => o.value);
const isSortValue = (v: string | null): v is SortValue => !!v && SORT_VALUES.includes(v);

/** The first page of the default (unfiltered, or ?categoryId=-scoped)
 * product list is prefetched server-side by the parent page.tsx and handed
 * down through a HydrationBoundary, so it resolves instantly from cache
 * instead of a second client fetch. Category, search and sort live in the
 * URL, so footer/category links and the header search always land on the
 * matching view, and Back restores the previous filter. */
export default function ProductsPageContent() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId") ?? undefined;
  const search = searchParams.get("search") ?? "";
  const sortParam = searchParams.get("sort");
  const sort: SortValue = isSortValue(sortParam) ? sortParam : "newest";

  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const { data: categoryData } = useActiveCategories();
  const categories = categoryData?.data ?? [];
  const activeCategory = categories.find((c) => c.id === categoryId);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useProductList({ search, sort, categoryId });
  const products = data?.pages.flatMap((p) => p.data) ?? [];

  const setParams = (next: { categoryId?: string; search?: string; sort?: SortValue }) => {
    const merged = { categoryId, search, sort, ...next };
    const params = new URLSearchParams();
    if (merged.categoryId) params.set("categoryId", merged.categoryId);
    if (merged.search) params.set("search", merged.search);
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const observerRef = useRef<HTMLDivElement | null>(null);
  const latestRef = useRef({ hasNextPage, isFetchingNextPage, fetchNextPage });
  latestRef.current = { hasNextPage, isFetchingNextPage, fetchNextPage };

  const loadMoreIfInRange = useCallback(() => {
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = latestRef.current;
    if (!observerRef.current || !hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, []);

  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) loadMoreIfInRange();
      },
      { threshold: 0, rootMargin: "600px 0px 600px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [products.length, loadMoreIfInRange]);

  const chips = [
    ...(activeCategory ? [{ label: activeCategory.name, remove: () => setParams({ categoryId: undefined }) }] : []),
    ...(search ? [{ label: `Search: “${search}”`, remove: () => setParams({ search: "" }) }] : []),
  ];
  const filterCount = chips.length + (sort !== "newest" ? 1 : 0);
  const clearFilters = () => router.replace(pathname, { scroll: false });

  const countLabel = isLoading
    ? "Loading products…"
    : products.length === 0
      ? "No products found"
      : `Showing ${products.length}${hasNextPage ? "+" : ""} ${products.length === 1 ? "product" : "products"}`;
  const title = search && !activeCategory ? `Results for “${search}”` : activeCategory?.name ?? "All Products";

  const pillClass = (on: boolean) =>
    `h-10 flex-none whitespace-nowrap rounded-full border px-[18px] text-sm font-semibold ${on ? "border-ka-green bg-ka-green text-ka-cream" : "border-ka-line bg-white text-ka-green"}`;

  return (
    <>
      <Wave from="#FAF6EE" to="#E8F0E4" />
      <section className="relative isolate overflow-clip border-b border-ka-gold/35 bg-ka-mint">
        <SectionDecor variant="a" />
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-[clamp(20px,4vw,56px)] py-[clamp(36px,4.4vw,64px)]">
          <nav aria-label="Breadcrumb" className="flex gap-2 text-[13px] text-ka-muted">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ka-green">Shop</span>
          </nav>
          <h1 className="m-0 font-display text-[clamp(38px,4.4vw,62px)] font-medium leading-[1.05] text-ka-green">{title}</h1>
          <p className="m-0 max-w-[560px] text-base leading-[1.6] text-ka-body">Classical Kerala preparations, made in small batches and chosen by health need.</p>
        </div>
      </section>
      <Wave from="#E8F0E4" to="#FAF6EE" shape="b" />

      <section className="relative isolate mx-auto max-w-[1280px] overflow-clip px-4 pb-[clamp(56px,7vw,112px)] pt-[clamp(28px,3.6vw,48px)] sm:px-[clamp(20px,4vw,56px)]">
        <SectionDecor variant="b" />
        <div className="flex flex-col gap-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5">
              <button type="button" onClick={() => setParams({ categoryId: undefined })} aria-pressed={!categoryId} className={pillClass(!categoryId)}>
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setParams({ categoryId: c.id === categoryId ? undefined : c.id })}
                  aria-pressed={c.id === categoryId}
                  className={pillClass(c.id === categoryId)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex h-10 flex-none items-center gap-2 whitespace-nowrap rounded-full border border-ka-green bg-white px-4 text-sm font-semibold text-ka-green"
            >
              <FilterIcon size={18} />
              {filterCount ? `Filters (${filterCount})` : "Filters"}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-ka-body" aria-live="polite">
              {countLabel}
            </span>
            <SortSelect value={sort} onChange={(v) => setParams({ sort: v })} />
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((ch) => (
                <button
                  key={ch.label}
                  type="button"
                  onClick={ch.remove}
                  aria-label={`Remove filter ${ch.label}`}
                  className="inline-flex h-[34px] items-center gap-2 rounded-full border border-ka-sage bg-ka-mint pl-3.5 pr-3 text-[13px] font-medium text-ka-green"
                >
                  {ch.label}
                  <CloseIcon size={12} strokeWidth={2.2} />
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(44%,240px),1fr))] gap-[clamp(12px,2vw,28px)]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-ka-sand" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-3.5 rounded-xl bg-ka-sand px-6 py-16 text-center">
              <span className="font-display text-[28px] text-ka-green">No products match these filters</span>
              <span className="text-[15px] text-ka-body">Try another health need or clear your search.</span>
              <button type="button" onClick={clearFilters} className="h-[46px] rounded-lg bg-ka-green px-6 text-sm font-semibold text-ka-cream">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(44%,240px),1fr))] gap-[clamp(12px,2vw,28px)]">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div ref={observerRef} className="h-10" />
              {isFetchingNextPage && <p className="text-center text-sm text-ka-muted">Loading more…</p>}
            </>
          )}
        </div>
      </section>

      <ShopFilterSheet
        open={sheetOpen}
        onClose={closeSheet}
        categories={categories}
        categoryId={categoryId}
        sort={sort}
        onCategory={(id) => setParams({ categoryId: id })}
        onSort={(v) => setParams({ sort: v })}
        onClear={clearFilters}
        resultLabel={isLoading ? "Show products" : `Show ${products.length}${hasNextPage ? "+" : ""} products`}
      />
    </>
  );
}
