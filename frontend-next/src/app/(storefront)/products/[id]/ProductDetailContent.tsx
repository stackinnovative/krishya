"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/format";
import { AYUSH_DISCLAIMER, AYUSH_LICENSE_NO } from "@/lib/contact";
import { useProductDetails, useRelatedProducts } from "@/modules/products/hooks/useStorefrontProducts";
import { useActiveCategories } from "@/modules/categories/hooks/useStorefrontCategories";
import { useAddToCart } from "@/modules/cart/hooks/useCart";
import { useToggleWishlist, useWishlistIds } from "@/modules/wishlist/hooks/useWishlist";
import ProductCard from "@/modules/products/components/storefront/ProductCard";
import { useStoreContact } from "@/modules/storefront-shell/hooks/useStoreContact";
import { SectionDecor, Wave } from "@/modules/storefront-shell/components/decor";
import { HeartIcon, LeafIcon, TruckIcon, WhatsAppIcon } from "@/modules/storefront-shell/components/icons";

type TabKey = "desc" | "store" | "delivery";
const TABS: { key: TabKey; label: string }[] = [
  { key: "desc", label: "Description" },
  { key: "store", label: "Storage" },
  { key: "delivery", label: "Delivery & Returns" },
];

const STORAGE_TEXT =
  "Store in a cool, dry place away from direct sunlight and keep the pack tightly closed after use. Oils may thicken in cold weather - warm gently before use. Shake liquid preparations well. Always use a dry spoon for powders. Keep out of reach of children.";

/** First sentence of the description - the short "benefit" line under the title. */
const leadSentence = (text: string) => {
  const match = text.match(/^.+?[.!?](\s|$)/);
  return (match ? match[0] : text).trim();
};

/** Prefetched server-side by the parent page.tsx (product details + related
 * products, once the category is known) and handed down through a
 * HydrationBoundary, so this resolves instantly from cache on first load
 * instead of firing a second client fetch. */
export default function ProductDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading } = useProductDetails(id);
  const { mutate: addToCart, mutateAsync: addToCartAsync, isPending: adding } = useAddToCart();
  const { data: wishIds } = useWishlistIds();
  const { mutate: toggleWish, isPending: toggling } = useToggleWishlist();
  const { data: categoryData } = useActiveCategories();
  const { freeAbove, deliveryCharge, whatsapp } = useStoreContact();
  const product = data?.data;

  const [colorId, setColorId] = useState<string | undefined>(undefined);
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<TabKey>("desc");
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!product) return;
    const firstColor = product.colorOptions[0];
    setColorId(firstColor?.id);
    const forColor = product.variants.filter((v) => !firstColor || v.colorOptionId === firstColor.id);
    const firstVariant = forColor.find((v) => v.isDefault && v.stock > 0) ?? forColor.find((v) => v.stock > 0) ?? forColor[0] ?? product.variants[0];
    setVariantId(firstVariant?.variantId);
    setImageIndex(0);
    setQuantity(1);
  }, [product]);

  const { data: related } = useRelatedProducts(product?.categoryId ?? "", id);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-[clamp(28px,5vw,72px)] px-[clamp(20px,4vw,56px)] py-10">
        <div className="aspect-square animate-pulse rounded-xl bg-ka-sand" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-40 animate-pulse rounded bg-ka-sand" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-ka-sand" />
          <div className="h-24 animate-pulse rounded bg-ka-sand" />
        </div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="m-0 font-display text-4xl font-medium text-ka-green">Product not found</h1>
        <p className="m-0 text-ka-body">It may have been removed or is no longer available.</p>
        <Link href="/products" className="mt-2 flex h-12 items-center rounded-lg bg-ka-green px-6 font-semibold text-ka-cream">
          Browse products
        </Link>
      </div>
    );
  }

  const activeColor = product.colorOptions.find((c) => c.id === colorId) ?? product.colorOptions[0];
  const images = activeColor?.images ?? [];
  const mainImage = images[imageIndex] ?? images[0];
  const sizes = product.variants.filter((v) => !activeColor || v.colorOptionId === activeColor.id);
  const activeVariant = product.variants.find((v) => v.variantId === variantId);
  const outOfStock = !activeVariant || activeVariant.stock === 0;
  const maxQty = Math.max(1, Math.min(activeVariant?.stock ?? 1, 20));
  const wished = wishIds?.data?.includes(product.id) ?? false;
  const categoryName = categoryData?.data?.find((c) => c.id === product.categoryId)?.name;
  const lead = product.description ? leadSentence(product.description) : "";
  const price = activeVariant ? formatCurrency(activeVariant.price) : "";

  const cartVars = () =>
    activeVariant ? { productId: product.id, variantId: activeVariant.variantId, quantity, name: product.name, size: activeVariant.size } : null;

  const handleAdd = () => {
    const vars = cartVars();
    if (vars) addToCart(vars);
  };
  const handleBuy = async () => {
    const vars = cartVars();
    if (!vars) return;
    setBuying(true);
    try {
      await addToCartAsync({ ...vars, silent: true });
      router.push("/checkout");
    } catch {
      setBuying(false);
    }
  };

  const pickColor = (cid: string) => {
    setColorId(cid);
    setImageIndex(0);
    const forColor = product.variants.filter((v) => v.colorOptionId === cid);
    setVariantId((forColor.find((v) => v.stock > 0) ?? forColor[0])?.variantId);
  };

  const waText = `Hello, I would like to know more about ${product.name}${activeVariant ? ` (${activeVariant.size})` : ""}.`;
  const addLabel = outOfStock ? "Out of stock" : adding && !buying ? "Adding…" : "Add to Cart";

  return (
    <>
      <section className="relative isolate mx-auto max-w-[1280px] overflow-clip px-[clamp(20px,4vw,56px)] pb-[clamp(48px,6vw,88px)] pt-[clamp(20px,2.6vw,36px)]">
        <SectionDecor variant="c" />
        <nav aria-label="Breadcrumb" className="mb-[clamp(20px,2.4vw,32px)] flex flex-wrap gap-2 text-[13px] text-ka-muted">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/products">Shop</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ka-green">{product.name}</span>
        </nav>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-start gap-[clamp(28px,5vw,72px)]">
          <div className="flex flex-col gap-3">
            <div
              className="relative aspect-square overflow-hidden rounded-xl border border-ka-sand bg-ka-sand"
              style={{ backgroundImage: "repeating-linear-gradient(135deg,rgba(31,77,58,.045) 0 1px,transparent 1px 11px)" }}
            >
              {mainImage ? (
                <Image src={getOptimizedImageUrl(mainImage.url, 1000)} alt={product.name} fill priority sizes="(max-width: 960px) 100vw, 50vw" className="object-cover" />
              ) : (
                <span className="grid h-full place-items-center text-ka-green/25">
                  <LeafIcon size={96} strokeWidth={0.9} />
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {images.map((img, i) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-pressed={i === imageIndex}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-ka-sand ${i === imageIndex ? "border-ka-green" : "border-transparent"}`}
                  >
                    <Image src={getOptimizedImageUrl(img.url, 240)} alt="" fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2.5">
              {categoryName && <span className="text-xs font-semibold uppercase tracking-[.16em] text-ka-muted">{categoryName}</span>}
              <h1 className="m-0 font-display text-[clamp(36px,3.8vw,54px)] font-medium leading-[1.05] text-ka-green">{product.name}</h1>
              {lead && <p className="m-0 text-base leading-[1.6] text-ka-body">{lead}</p>}
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-ka-gold/45 pb-5">
              <span className="font-display text-[40px] font-bold leading-none text-ka-gold">{price}</span>
              {activeVariant && <span className="text-[13.5px] text-ka-muted">{activeVariant.size} · inclusive of all taxes</span>}
            </div>

            {product.colorOptions.length > 1 && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold uppercase tracking-[.16em] text-ka-green">Option{activeColor?.colorName ? `: ${activeColor.colorName}` : ""}</span>
                <div className="flex flex-wrap gap-2.5">
                  {product.colorOptions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => pickColor(c.id)}
                      title={c.colorName}
                      aria-label={c.colorName || "Option"}
                      aria-pressed={c.id === activeColor?.id}
                      className="h-9 w-9 rounded-full"
                      style={{ background: c.hex || "#EFE6D8", boxShadow: c.id === activeColor?.id ? "0 0 0 2px #FAF6EE, 0 0 0 4px #1F4D3A" : "0 0 0 1px #D9CFBE" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold uppercase tracking-[.16em] text-ka-green">Size</span>
                <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Size">
                  {sizes.map((v) => {
                    const on = v.variantId === variantId;
                    return (
                      <button
                        key={v.variantId}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => {
                          setVariantId(v.variantId);
                          setQuantity(1);
                        }}
                        disabled={v.stock === 0}
                        className={`flex h-[58px] min-w-[104px] flex-col items-center justify-center gap-0.5 rounded-lg border-[1.5px] px-4 disabled:opacity-40 ${
                          on ? "border-ka-green bg-ka-green text-ka-cream" : "border-ka-line bg-white text-ka-green"
                        }`}
                      >
                        <span className="text-[14.5px] font-semibold">{v.size}</span>
                        <span className={`text-[12.5px] ${on ? "text-ka-mint" : "text-ka-muted"}`}>{v.stock === 0 ? "Sold out" : formatCurrency(v.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-[52px] items-center rounded-lg border border-ka-line bg-white">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="h-full w-[46px] text-xl text-ka-green">
                  −
                </button>
                <span className="w-[34px] text-center text-base font-semibold" aria-live="polite">
                  {quantity}
                </span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} aria-label="Increase quantity" className="h-full w-[46px] text-xl text-ka-green">
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock || adding}
                className="h-[52px] flex-[1_1_150px] rounded-lg border border-ka-green bg-ka-green text-[15px] font-semibold text-ka-cream hover:bg-ka-green-dark disabled:opacity-50"
              >
                {addLabel}
              </button>
              <button
                type="button"
                onClick={handleBuy}
                disabled={outOfStock || adding}
                className="h-[52px] flex-[1_1_130px] rounded-lg border border-ka-gold bg-transparent text-[15px] font-semibold text-ka-green hover:bg-ka-gold/[.12] disabled:opacity-50"
              >
                {buying ? "Please wait…" : "Buy Now"}
              </button>
              <button
                type="button"
                onClick={() => toggleWish({ productId: product.id, name: product.name })}
                disabled={toggling}
                aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                aria-pressed={wished}
                className={`grid h-[52px] w-[52px] place-items-center rounded-lg border border-ka-line bg-white ${wished ? "text-ka-gold" : "text-ka-green"}`}
              >
                <HeartIcon size={20} filled={wished} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 rounded-[10px] bg-ka-mint px-[18px] py-4 text-sm text-ka-ink">
              <span className="flex items-center gap-2.5">
                <TruckIcon size={18} strokeWidth={1.5} className="flex-none text-ka-green" />
                {deliveryCharge <= 0 ? "Free delivery · " : freeAbove > 0 ? `Free delivery above ${formatCurrency(freeAbove)} · ` : ""}Delivered in 2–7 days across India
              </span>
              <a href={whatsapp(waText)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 font-semibold text-ka-wa">
                <WhatsAppIcon size={18} className="flex-none" />
                Ask about this product on WhatsApp
              </a>
            </div>

            <div className="flex flex-col">
              <div role="tablist" aria-label="Product information" className="no-scrollbar flex gap-[clamp(14px,2vw,28px)] overflow-x-auto border-b border-ka-green/15">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    id={`tab-${t.key}`}
                    aria-selected={tab === t.key}
                    aria-controls={`panel-${t.key}`}
                    onClick={() => setTab(t.key)}
                    className={`-mb-px flex-none border-b-2 py-3 text-[14.5px] font-semibold ${tab === t.key ? "border-ka-gold text-ka-green" : "border-transparent text-ka-muted"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-5 text-[15px] leading-[1.75] text-[#3F423B]">
                {tab === "desc" && <p className="m-0 whitespace-pre-line text-pretty">{product.description || "Details for this product will be added soon."}</p>}
                {tab === "store" && <p className="m-0">{STORAGE_TEXT}</p>}
                {tab === "delivery" && (
                  <p className="m-0">
                    Orders are dispatched within 1–2 working days and delivered in 2–4 days within Kerala, 4–7 days elsewhere in India. Unopened products can be returned
                    within 7 days of delivery - see our{" "}
                    <Link href="/policies/shipping" className="font-semibold text-ka-green underline">
                      shipping
                    </Link>{" "}
                    and{" "}
                    <Link href="/policies/returns" className="font-semibold text-ka-green underline">
                      returns
                    </Link>{" "}
                    policies.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 rounded-[10px] border border-ka-gold/60 bg-ka-ivory px-[18px] py-4">
              {AYUSH_LICENSE_NO && <span className="text-[13px] font-bold tracking-[.04em] text-ka-green">AYUSH License No: {AYUSH_LICENSE_NO}</span>}
              <span className="text-[13px] leading-[1.6] text-ka-body">{AYUSH_DISCLAIMER}</span>
            </div>
          </div>
        </div>
      </section>

      {!!related?.data?.length && (
        <>
          <Wave from="#FAF6EE" to="#E8F0E4" />
          <section className="relative isolate overflow-clip bg-ka-mint py-[clamp(48px,6vw,88px)]">
            <SectionDecor variant="d" />
            <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,56px)]">
              <h2 className="m-0 mb-[clamp(24px,3vw,40px)] font-display text-[clamp(30px,3.2vw,44px)] font-medium text-ka-green">You may also like</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(44%,250px),1fr))] gap-[clamp(12px,2vw,28px)]">
                {related.data.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Phone buy bar, docked just above the tab bar. */}
      <div className="fixed inset-x-0 bottom-[calc(70px+env(safe-area-inset-bottom))] z-40 flex items-center gap-3 border-t border-ka-sand bg-white px-3.5 py-2.5 shadow-[0_-10px_24px_-18px_rgba(31,77,58,.5)] ka:hidden">
        <span className="flex min-w-0 flex-col leading-[1.1]">
          <span className="font-display text-2xl font-bold text-ka-gold-deep">{price}</span>
          {activeVariant && <span className="truncate text-[11.5px] text-ka-muted">{activeVariant.size}</span>}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock || adding}
          className="h-[46px] flex-1 whitespace-nowrap rounded-xl border border-ka-green bg-white text-sm font-bold text-ka-green disabled:opacity-50"
        >
          {outOfStock ? "Out of stock" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={handleBuy}
          disabled={outOfStock || adding}
          className="h-[46px] flex-1 whitespace-nowrap rounded-xl bg-ka-green text-sm font-bold text-ka-cream disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>
    </>
  );
}
