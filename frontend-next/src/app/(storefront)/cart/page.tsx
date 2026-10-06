"use client";

import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useCart, useRemoveCartItem, useUpdateCartCount } from "@/modules/cart/hooks/useCart";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import Button from "@/modules/storefront-shell/components/Button";

export default function CartPage() {
  const { data, isLoading } = useCart();
  const { mutate: updateCount, isPending: updatingCount, variables: updateVars } = useUpdateCartCount();
  const { mutate: removeItem, isPending: removing, variables: removeVars } = useRemoveCartItem();
  const { data: settingsRes } = useSettings();
  const freeAbove = settingsRes?.data?.freeAbove ?? 0;

  const cart = data?.data;

  if (isLoading) {
    return <div className="py-24 text-center text-sm" style={{ color: "var(--muted)" }}>Loading cart…</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold">Your cart is empty</h1>
        <Link href="/products" className="mt-4 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: "var(--accent)" }}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-serif text-3xl font-semibold">Your cart</h1>
      <div className="flex flex-col gap-4">
        {cart.items.map((item) => (
          <div key={item.itemId} className="flex items-center gap-4 rounded-2xl border p-3" style={{ borderColor: "var(--border)" }}>
            <div className="relative h-20 w-20 flex-none overflow-hidden rounded-xl" style={{ background: "var(--bg-secondary)" }}>
              {item.product.image && <Image src={getOptimizedImageUrl(item.product.image, 160)} alt={item.product.name} fill sizes="80px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{item.product.name}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>Size {item.variant.size}</div>
              <div className="mt-1 text-sm font-semibold">₹{item.product.price.toLocaleString("en-IN")}</div>
            </div>
            <div className="flex items-center rounded-full border" style={{ borderColor: "var(--border)" }}>
              <Button
                variant="ghost"
                className="px-3 py-1.5"
                disabled={updatingCount && updateVars?.itemId === item.itemId}
                onClick={() => updateCount({ cartId: cart.id, itemId: item.itemId, action: "decrement" })}
              >
                −
              </Button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <Button
                variant="ghost"
                className="px-3 py-1.5"
                disabled={updatingCount && updateVars?.itemId === item.itemId}
                onClick={() => updateCount({ cartId: cart.id, itemId: item.itemId, action: "increment" })}
              >
                +
              </Button>
            </div>
            <Button
              variant="ghost"
              className="text-xs font-semibold"
              style={{ color: "#b8412f" }}
              disabled={removing && removeVars?.itemId === item.itemId}
              onClick={() => removeItem({ cartId: cart.id, itemId: item.itemId })}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 ml-auto max-w-sm rounded-2xl p-5" style={{ background: "var(--bg-secondary)" }}>
        {freeAbove > 0 && (
          <div className="mb-3 rounded-lg px-3 py-2 text-xs font-medium" style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}>
            {cart.totalPrice >= freeAbove
              ? "You've unlocked free delivery!"
              : `Add ₹${(freeAbove - cart.totalPrice).toLocaleString("en-IN")} more for free delivery`}
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹{cart.totalPrice.toLocaleString("en-IN")}</span>
        </div>
        <div className="mt-1.5 flex justify-between text-sm">
          <span>Delivery</span>
          <span>{cart.deliveryCharge ? `₹${cart.deliveryCharge}` : "Free"}</span>
        </div>
        <div className="mt-3 flex justify-between border-t pt-3 text-base font-semibold" style={{ borderColor: "var(--border)" }}>
          <span>Total</span>
          <span>₹{cart.total.toLocaleString("en-IN")}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 block rounded-full py-3 text-center text-sm font-semibold uppercase tracking-wide text-white"
          style={{ background: "var(--accent)" }}
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
