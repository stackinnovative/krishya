"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useProductDetails, useRelatedProducts } from "@/modules/products/hooks/useStorefrontProducts";
import { useAddToCart } from "@/modules/cart/hooks/useCart";
import ProductCard from "@/modules/products/components/storefront/ProductCard";
import Button from "@/modules/storefront-shell/components/Button";

/** Prefetched server-side by the parent page.tsx (product details + related
 * products, once the category is known) and handed down through a
 * HydrationBoundary, so this resolves instantly from cache on first load
 * instead of firing a second client fetch. */
export default function ProductDetailContent({ id }: { id: string }) {
  const { data, isLoading } = useProductDetails(id);
  const { mutate: addToCart, isPending: adding } = useAddToCart();
  const product = data?.data;

  const [colorId, setColorId] = useState<string | undefined>(undefined);
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    const firstColor = product.colorOptions[0];
    setColorId(firstColor?.id);
    const firstVariant = product.variants.find((v) => v.colorOptionId === firstColor?.id) ?? product.variants[0];
    setVariantId(firstVariant?.variantId);
  }, [product]);

  const { data: related } = useRelatedProducts(product?.categoryId ?? "", id);

  if (isLoading) {
    return <div className="py-24 text-center text-sm" style={{ color: "var(--muted)" }}>Loading…</div>;
  }
  if (!product) {
    return <div className="py-24 text-center text-sm" style={{ color: "var(--muted)" }}>Product not found.</div>;
  }

  const activeColor = product.colorOptions.find((c) => c.id === colorId) ?? product.colorOptions[0];
  const images = activeColor?.images ?? [];
  const sizesForColor = product.variants.filter((v) => v.colorOptionId === colorId);
  const activeVariant = product.variants.find((v) => v.variantId === variantId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
            {images[0] && <Image src={getOptimizedImageUrl(images[0].url, 800)} alt={product.name} fill sizes="600px" className="object-cover" />}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <div key={i} className="relative h-20 w-20 flex-none overflow-hidden rounded-xl" style={{ background: "var(--bg-secondary)" }}>
                  <Image src={getOptimizedImageUrl(img.url, 160)} alt="" fill sizes="80px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-serif text-3xl font-semibold">{product.name}</h1>
          <div className="mt-2 text-2xl font-semibold" style={{ color: "var(--accent-strong)" }}>
            {activeVariant ? `₹${activeVariant.price.toLocaleString("en-IN")}` : ""}
          </div>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {product.description}
          </p>

          {product.colorOptions.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Colour</div>
              <div className="flex flex-wrap gap-2">
                {product.colorOptions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setColorId(c.id);
                      const firstVariant = product.variants.find((v) => v.colorOptionId === c.id);
                      setVariantId(firstVariant?.variantId);
                    }}
                    title={c.colorName}
                    className="h-8 w-8 rounded-full"
                    style={{ background: c.hex || "#ccc", boxShadow: colorId === c.id ? "0 0 0 2px var(--accent)" : "0 0 0 1px var(--border)" }}
                  />
                ))}
              </div>
            </div>
          )}

          {sizesForColor.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Size</div>
              <div className="flex flex-wrap gap-2">
                {sizesForColor.map((v) => (
                  <button
                    key={v.variantId}
                    onClick={() => setVariantId(v.variantId)}
                    disabled={v.stock === 0}
                    className="rounded-full border px-4 py-2 text-sm font-medium disabled:opacity-40"
                    style={{ borderColor: variantId === v.variantId ? "var(--accent)" : "var(--border)", background: variantId === v.variantId ? "var(--accent-soft)" : "transparent" }}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border" style={{ borderColor: "var(--border)" }}>
              <Button variant="ghost" className="px-3 py-2" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                −
              </Button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <Button
                variant="ghost"
                className="px-3 py-2"
                onClick={() => setQuantity((q) => Math.min(activeVariant?.stock ?? 99, q + 1))}
              >
                +
              </Button>
            </div>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!activeVariant || activeVariant.stock === 0}
              loading={adding}
              loadingText="Adding…"
              onClick={() => variantId && addToCart({ productId: product.id, variantId, quantity })}
            >
              {activeVariant?.stock === 0 ? "Out of stock" : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>

      {!!related?.data?.length && (
        <div className="mt-16">
          <h2 className="mb-6 font-serif text-2xl font-semibold">You may also like</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.data.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
