"use client";

import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/format";
import { useCart, useRemoveCartItem, useUpdateCartCount } from "@/modules/cart/hooks/useCart";
import { useStoreContact } from "@/modules/storefront-shell/hooks/useStoreContact";
import { ArrowRightIcon, BagIcon, LeafIcon, LockIcon, TrashIcon, TruckIcon } from "@/modules/storefront-shell/components/icons";

export default function CartPage() {
  const { data, isLoading } = useCart();
  const { mutate: updateCount, isPending: updatingCount, variables: updateVars } = useUpdateCartCount();
  const { mutate: removeItem, isPending: removing, variables: removeVars } = useRemoveCartItem();
  const { freeAbove } = useStoreContact();

  const cart = data?.data;
  const items = cart?.items ?? [];
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const itemsLabel = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <section className="relative isolate mx-auto max-w-[1200px] overflow-clip px-4 pb-[clamp(32px,7vw,104px)] pt-[clamp(20px,4.4vw,64px)] sm:px-[clamp(16px,4vw,56px)]">
      <div className="mb-[clamp(14px,3vw,36px)] flex flex-col gap-0.5">
        <h1 className="m-0 font-display text-[clamp(30px,4.4vw,58px)] font-semibold leading-[1.05] text-ka-green">Your Cart</h1>
        {items.length > 0 && <span className="text-[13.5px] text-ka-muted">{itemsLabel} in your cart</span>}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {[0, 1].map((i) => (
            <div key={i} className="h-[140px] animate-pulse rounded-2xl bg-ka-sand" />
          ))}
        </div>
      ) : !cart || items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-ka-mint px-6 py-[clamp(48px,6vw,88px)] text-center">
          <span className="grid h-[84px] w-[84px] place-items-center rounded-full bg-ka-cream text-ka-green">
            <BagIcon size={36} strokeWidth={1.3} />
          </span>
          <span className="font-display text-[32px] font-medium text-ka-green">Your cart is empty</span>
          <span className="max-w-[420px] text-[15px] leading-[1.6] text-ka-body">Explore classical Kerala preparations chosen by health need.</span>
          <Link href="/products" className="mt-2 flex h-[52px] items-center whitespace-nowrap rounded-lg bg-ka-green px-[30px] text-[15px] font-semibold text-ka-cream">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-5 ka:gap-[clamp(24px,4vw,56px)]">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-[clamp(12px,2vw,20px)]">
            {freeAbove > 0 && (
              <div className="flex items-center gap-3 rounded-[14px] bg-ka-mint px-3.5 py-3">
                <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-full bg-ka-cream text-ka-green">
                  <TruckIcon size={20} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
                  <span className="font-display text-[17px] font-semibold leading-[1.1] text-ka-green">
                    {cart.totalPrice >= freeAbove ? "You've unlocked free delivery" : `Add ${formatCurrency(freeAbove - cart.totalPrice)} more for free delivery`}
                  </span>
                  <div
                    className="h-[5px] overflow-hidden rounded-[3px] bg-ka-cream"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.min(100, Math.round((cart.totalPrice / freeAbove) * 100))}
                    aria-label="Progress to free delivery"
                  >
                    <div className="h-full rounded-[3px] bg-ka-green transition-[width] duration-300" style={{ width: `${Math.min(100, Math.round((cart.totalPrice / freeAbove) * 100))}%` }} />
                  </div>
                </div>
              </div>
            )}

            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {items.map((item) => {
                const busy = (updatingCount && updateVars?.itemId === item.itemId) || (removing && removeVars?.itemId === item.itemId);
                return (
                  <li key={item.itemId} className={`flex gap-[clamp(12px,2vw,20px)] rounded-2xl border border-ka-sand bg-white p-2.5 shadow-[0_8px_20px_-18px_rgba(31,77,58,.5)] ${busy ? "opacity-70" : ""}`}>
                    <span className="relative aspect-square w-[clamp(92px,9vw,120px)] flex-none overflow-hidden rounded-xl bg-ka-sand">
                      {item.product.image ? (
                        <Image src={getOptimizedImageUrl(item.product.image, 240)} alt={item.product.name} fill sizes="120px" className="object-cover" />
                      ) : (
                        <span className="grid h-full place-items-center text-ka-green/30">
                          <LeafIcon size={32} />
                        </span>
                      )}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-[3px] pr-0.5 pt-0.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <span className="font-display text-[clamp(19px,1.8vw,23px)] font-semibold leading-[1.1] text-ka-green">{item.product.name}</span>
                        <span className="flex-none whitespace-nowrap font-display text-[clamp(19px,1.8vw,23px)] font-bold leading-[1.1] text-ka-gold-deep">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                      <span className="text-[13px] text-ka-muted">
                        {item.variant.size}
                        {item.quantity > 1 ? ` · ${formatCurrency(item.product.price)} each` : ""}
                      </span>
                      <div className="mt-auto flex items-center justify-between gap-2.5 pt-2">
                        <div className="flex h-9 items-center rounded-[10px] border border-ka-line-soft bg-ka-cream">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.product.name}`}
                            disabled={busy || item.quantity <= 1}
                            onClick={() => updateCount({ cartId: cart.id, itemId: item.itemId, action: "decrement" })}
                            className="h-full w-9 text-lg text-ka-green disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-[14.5px] font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.product.name}`}
                            disabled={busy}
                            onClick={() => updateCount({ cartId: cart.id, itemId: item.itemId, action: "increment" })}
                            className="h-full w-9 text-lg text-ka-green disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeItem({ cartId: cart.id, itemId: item.itemId, name: item.product.name })}
                          className="inline-flex items-center gap-[5px] whitespace-nowrap py-1.5 text-[13px] text-ka-muted hover:text-ka-green"
                        >
                          <TrashIcon size={15} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link href="/products" className="hidden self-start border-b border-ka-gold pb-[3px] text-[14.5px] font-semibold text-ka-green ka:block">
              ← Continue Shopping
            </Link>
          </div>

          {/* Desktop: sticky summary card. Phone: compact summary docked above the tab bar. */}
          <aside className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-[5] flex w-full flex-col gap-2 rounded-2xl border border-ka-sand bg-ka-cream p-2 shadow-[0_-16px_36px_-20px_rgba(31,77,58,.45)] ka:bottom-auto ka:top-[108px] ka:w-auto ka:max-w-[420px] ka:flex-[1_1_320px] ka:gap-3 ka:bg-white ka:p-7 ka:shadow-[0_20px_40px_-32px_rgba(31,77,58,.35)]">
            <div className="flex flex-col gap-[3px] rounded-xl bg-white px-3.5 pb-2 pt-2.5 ka:gap-3 ka:p-0">
              <span className="mb-1 font-display text-[19px] font-semibold leading-[1.1] text-ka-green ka:mb-0 ka:text-[26px]">Order Summary</span>
              <div className="flex justify-between gap-3 text-[13px] leading-[1.4] text-ka-muted ka:text-[15px] ka:text-ka-body">
                <span className="whitespace-nowrap">Subtotal ({itemsLabel})</span>
                <span className="text-ka-ink">{formatCurrency(cart.totalPrice)}</span>
              </div>
              <div className="flex justify-between gap-3 text-[13px] leading-[1.4] text-ka-muted ka:text-[15px] ka:text-ka-body">
                <span>Delivery</span>
                <span className={`font-semibold ${cart.deliveryCharge ? "text-ka-ink" : "text-[#2F7A4F]"}`}>{cart.deliveryCharge ? formatCurrency(cart.deliveryCharge) : "Free"}</span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between border-t border-ka-gold/50 pt-[5px] ka:mt-0 ka:pt-3.5">
                <span className="font-display text-lg font-bold text-ka-green ka:font-body ka:text-base ka:font-semibold">Total</span>
                <span className="font-display text-[22px] font-bold leading-none text-ka-green ka:text-[32px]">{formatCurrency(cart.total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="flex h-[46px] items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-ka-green text-[15.5px] font-semibold text-ka-cream shadow-[0_10px_22px_-12px_rgba(31,77,58,.8)] hover:bg-ka-green-dark ka:mt-1.5 ka:h-[54px] ka:rounded-lg ka:shadow-none"
            >
              <span className="ka:hidden">Checkout</span>
              <span className="hidden ka:inline">Proceed to Checkout</span>
              <span className="h-1 w-1 rounded-full bg-ka-gold ka:hidden" />
              <span className="ka:hidden">{formatCurrency(cart.total)}</span>
              <ArrowRightIcon size={18} strokeWidth={1.8} className="ka:hidden" />
            </Link>
            <span className="hidden items-center justify-center gap-2 text-[12.5px] text-ka-muted ka:flex">
              <LockIcon size={14} strokeWidth={1.8} className="text-ka-green" />
              Secure checkout · No account needed
            </span>
          </aside>
        </div>
      )}
    </section>
  );
}
