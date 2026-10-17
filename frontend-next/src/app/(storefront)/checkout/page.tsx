"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { getGuestId } from "@/lib/guest";
import { env } from "@/lib/env";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/format";
import { openRazorpayCheckoutFunction, openRazorpayCheckoutTestFunction } from "@/lib/razorpay";
import { useCart } from "@/modules/cart/hooks/useCart";
import { createOrderApi, verifyPaymentApi } from "@/modules/orders/api/order.api";
import Button from "@/modules/storefront-shell/components/Button";
import { useStoreContact } from "@/modules/storefront-shell/hooks/useStoreContact";
import { SectionDecor } from "@/modules/storefront-shell/components/decor";
import { CheckIcon, LeafIcon, LockIcon } from "@/modules/storefront-shell/components/icons";

const STATE_OPTIONS = [
  "Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Telangana", "Delhi", "Uttar Pradesh", "Maharashtra", "Gujarat", "Goa",
];

const PAYMENT_METHODS = [
  { label: "UPI", sub: "Google Pay, PhonePe, Paytm, BHIM" },
  { label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
  { label: "Net Banking", sub: "All major Indian banks" },
];

const inputClass =
  "h-12 w-full rounded-lg border border-ka-line bg-ka-cream px-3.5 text-[15px] font-normal text-ka-ink outline-none focus:border-ka-sage focus:ring-2 focus:ring-ka-sage/40";
const labelClass = "flex flex-col gap-1.5 text-[13px] font-semibold text-ka-green";
const fieldsetClass = "m-0 flex min-w-0 flex-col gap-4 rounded-xl border border-ka-sand bg-white p-[clamp(18px,3vw,28px)]";
const legendClass = "float-left mb-1 w-full p-0 font-display text-2xl font-semibold text-ka-green";

/** Only ever used to skip typing through this form by hand while testing against Razorpay's test mode - never shown once NEXT_PUBLIC_PAYMENT_MODE is "live". */
const SAMPLE_CHECKOUT_DATA = {
  name: "Test User",
  email: "test@example.com",
  phone: "9999999999",
  addressLine1: "123 Test Street",
  addressLine2: "Near Test Landmark",
  city: "Kochi",
  state: "Kerala",
  pincode: "682001",
  acceptedTerms: true,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartRes, isLoading } = useCart();
  const cart = cartRes?.data;
  const { storeName } = useStoreContact();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: STATE_OPTIONS[0]!, pincode: "", acceptedTerms: false,
  });
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const { mutateAsync: createOrder, isPending } = useMutation({ mutationFn: createOrderApi });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart) return;
    if (!form.acceptedTerms) return toast.error("Please accept the terms to continue.");

    try {
      const res = await createOrder({ guestId: getGuestId(), cartId: cart.id, ...form });
      const order = res.data;
      if (!order) throw new Error("no order");

      const details = { storeName, prefill: { name: form.name, email: form.email, contact: form.phone } };
      const goToSuccess = (orderId: string) => router.push(`/checkout/success/${orderId}?guestId=${getGuestId()}`);

      if (env.paymentMode === "test") {
        openRazorpayCheckoutTestFunction(order, details, goToSuccess, (paymentResponse) => verifyPaymentApi(paymentResponse));
      } else {
        openRazorpayCheckoutFunction(order, details, goToSuccess);
      }
    } catch {
      toast.error("Could not start checkout. Try again.");
    }
  };

  const items = cart?.items ?? [];

  return (
    <section className="relative isolate mx-auto max-w-[1200px] overflow-clip px-4 pb-[clamp(56px,7vw,104px)] pt-[clamp(28px,4.4vw,64px)] sm:px-[clamp(20px,4vw,56px)]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <SectionDecor variant="b" />

      <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-center gap-3.5">
        <h1 className="m-0 font-display text-[clamp(38px,4.4vw,58px)] font-medium text-ka-green">Checkout</h1>
        <span className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full bg-ka-mint px-3.5 text-[13px] font-semibold text-ka-green">
          <CheckIcon size={14} strokeWidth={2} />
          No account needed
        </span>
        {env.paymentMode === "test" && (
          <Button type="button" variant="outline" className="ml-auto h-10! text-sm!" onClick={() => setForm(SAMPLE_CHECKOUT_DATA)}>
            Fill sample data
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="h-[420px] animate-pulse rounded-xl bg-ka-sand" />
      ) : !cart || items.length === 0 ? (
        <div className="flex flex-col items-center gap-3.5 rounded-2xl bg-ka-mint px-6 py-12 text-center">
          <span className="font-display text-[28px] text-ka-green">Your cart is empty</span>
          <Link href="/products" className="flex h-12 items-center whitespace-nowrap rounded-lg bg-ka-green px-[26px] text-[14.5px] font-semibold text-ka-cream">
            Browse products
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-[clamp(24px,4vw,56px)]">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-7">
            <fieldset className={fieldsetClass}>
              <legend className={legendClass}>1. Contact</legend>
              <label className={labelClass}>
                Full name
                <input required autoComplete="name" placeholder="e.g. Lakshmi Menon" value={form.name} onChange={set("name")} className={inputClass} />
              </label>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                <label className={labelClass}>
                  Phone (WhatsApp)
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+91 98XXX XXXXX"
                    value={form.phone}
                    onChange={set("phone")}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Email
                  <input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set("email")} className={inputClass} />
                </label>
              </div>
            </fieldset>

            <fieldset className={fieldsetClass}>
              <legend className={legendClass}>2. Delivery address</legend>
              <label className={`${labelClass} max-w-[220px]`}>
                Pincode
                <input
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  title="6-digit pincode"
                  placeholder="682001"
                  value={form.pincode}
                  onChange={set("pincode")}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Address
                <input required autoComplete="address-line1" placeholder="House name, street" value={form.addressLine1} onChange={set("addressLine1")} className={inputClass} />
              </label>
              <label className={labelClass}>
                Landmark (optional)
                <input autoComplete="address-line2" placeholder="Near…" value={form.addressLine2} onChange={set("addressLine2")} className={inputClass} />
              </label>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                <label className={labelClass}>
                  City
                  <input required autoComplete="address-level2" placeholder="Kochi" value={form.city} onChange={set("city")} className={inputClass} />
                </label>
                <label className={labelClass}>
                  State
                  <select required autoComplete="address-level1" value={form.state} onChange={set("state")} className={inputClass}>
                    {STATE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </fieldset>

            <fieldset className={`${fieldsetClass} gap-3`}>
              <legend className={legendClass}>3. Payment</legend>
              <p className="m-0 text-sm leading-relaxed text-ka-body">
                You&apos;ll choose how to pay in the secure Razorpay window after placing your order.
              </p>
              <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2.5 p-0">
                {PAYMENT_METHODS.map((m) => (
                  <li key={m.label} className="flex flex-col gap-0.5 rounded-[10px] border-[1.5px] border-ka-line bg-white px-4 py-3.5">
                    <span className="text-[15px] font-semibold text-ka-green">{m.label}</span>
                    <span className="text-[13px] text-ka-muted">{m.sub}</span>
                  </li>
                ))}
              </ul>
              <label className="mt-2 flex items-start gap-2.5 text-sm text-ka-ink">
                <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(e) => setForm((f) => ({ ...f, acceptedTerms: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 flex-none accent-ka-green"
                />
                <span>
                  I accept the{" "}
                  <Link href="/policies/terms" target="_blank" className="font-semibold text-ka-green underline">
                    terms &amp; conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/policies/returns" target="_blank" className="font-semibold text-ka-green underline">
                    returns policy
                  </Link>
                </span>
              </label>
            </fieldset>
          </div>

          <aside className="flex w-full flex-col gap-3.5 rounded-xl bg-ka-sand p-[clamp(20px,3vw,28px)] ka:sticky ka:top-[108px] ka:w-auto ka:max-w-[420px] ka:flex-[1_1_320px]">
            <span className="font-display text-[26px] font-semibold text-ka-green">Order Summary</span>
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {items.map((item) => (
                <li key={item.itemId} className="flex items-center gap-3">
                  <span className="relative h-14 w-14 flex-none rounded-lg border border-ka-green/10 bg-ka-cream">
                    <span className="absolute inset-0 overflow-hidden rounded-[7px]">
                      {item.product.image ? (
                        <Image src={getOptimizedImageUrl(item.product.image, 120)} alt="" fill sizes="56px" className="object-cover" />
                      ) : (
                        <span className="grid h-full place-items-center text-ka-green/30">
                          <LeafIcon size={22} />
                        </span>
                      )}
                    </span>
                    <span className="absolute -right-[7px] -top-[7px] grid h-5 min-w-5 place-items-center rounded-[10px] bg-ka-green px-1 text-[11px] font-bold text-ka-cream">
                      {item.quantity}
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[14.5px] font-semibold text-ka-green">{item.product.name}</span>
                    <span className="text-[12.5px] text-ka-muted">{item.variant.label}</span>
                  </span>
                  <span className="text-[14.5px] font-semibold">{formatCurrency(item.product.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="my-1 h-px bg-ka-gold/60" />
            <div className="flex justify-between text-[15px]">
              <span className="text-ka-body">Subtotal</span>
              <span>{formatCurrency(cart.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-ka-body">Delivery</span>
              <span>{cart.deliveryCharge ? formatCurrency(cart.deliveryCharge) : "Free"}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-ka-gold/60 pt-3">
              <span className="text-base font-semibold text-ka-green">Total</span>
              <span className="font-display text-[32px] font-bold text-ka-green">{formatCurrency(cart.total)}</span>
            </div>
            <Button type="submit" className="mt-1.5 h-[54px]! text-[15.5px]!" loading={isPending} loadingText="Starting payment…">
              Place Order · {formatCurrency(cart.total)}
            </Button>
            <span className="flex items-center justify-center gap-2 text-[12.5px] text-ka-body">
              <LockIcon size={14} strokeWidth={1.8} className="text-ka-green" />
              Payments are 256-bit SSL encrypted
            </span>
          </aside>
        </form>
      )}
    </section>
  );
}
