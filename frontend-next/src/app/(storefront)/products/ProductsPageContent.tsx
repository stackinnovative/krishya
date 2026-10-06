"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, FilterX } from "lucide-react";
import { useProductList } from "@/modules/products/hooks/useStorefrontProducts";
import { useActiveCategories } from "@/modules/categories/hooks/useStorefrontCategories";
import ProductCard from "@/modules/products/components/storefront/ProductCard";
import CategoryPills from "@/modules/categories/components/CategoryPills";
import SortSelect, { type SortValue } from "@/modules/products/components/storefront/SortSelect";

/** The first page of the default (unfiltered, or ?categoryId=-scoped)
 * product list is prefetched server-side by the parent page.tsx and handed
 * down through a HydrationBoundary, so it resolves instantly from cache
 * instead of a second client fetch - filters/sort/search/infinite-scroll
 * beyond that first page stay fully client-driven exactly as before. */
export default function ProductsPageContent() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get("categoryId") ?? undefined;

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("newest");
  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategoryId);

  const { data: categoryData } = useActiveCategories();
  const categories = categoryData?.data ?? [];

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useProductList({
    search,
    sort,
    categoryId,
  });

  const products = data?.pages.flatMap((p) => p.data) ?? [];

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

  const hasActiveFilters = Boolean(categoryId || search || sort !== "newest");
  const resetFilters = () => {
    setCategoryId(undefined);
    setSearch("");
    setSort("newest");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-serif text-3xl font-semibold">Shop</h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="order-2 flex flex-wrap items-center gap-2 sm:order-1">
            <SortSelect value={sort} onChange={setSort} />
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                <FilterX size={13} />
                Clear filters
              </button>
            )}
          </div>

          <div className="order-1 flex h-11 w-full items-center gap-2 rounded-full border px-4 sm:order-2 sm:w-72" style={{ borderColor: "var(--border)" }}>
            <Search size={16} style={{ color: "var(--muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="w-full border-none bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <CategoryPills items={categories} activeId={categoryId} onSelect={(id) => setCategoryId(id === categoryId ? undefined : id)} />
      </div>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl" style={{ background: "var(--bg-secondary)" }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-sm" style={{ color: "var(--muted)" }}>
          No products match your filters.
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div ref={observerRef} className="mt-8 h-10" />
          {isFetchingNextPage && (
            <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
              Loading more…
            </p>
          )}
        </>
      )}
    </div>
  );
}
