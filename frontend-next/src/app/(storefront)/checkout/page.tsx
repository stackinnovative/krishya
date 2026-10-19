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
import { getApiFieldErrors } from "@/lib/errors";
import { formatCurrency } from "@/lib/format";
import { openRazorpayCheckoutFunction, openRazorpayCheckoutTestFunction } from "@/lib/razorpay";
import { useCart } from "@/modules/cart/hooks/useCart";
import { createOrderApi, verifyPaymentApi } from "@/modules/orders/api/order.api";
import { CHECKOUT_RULES, normalizeIndianPhone, type CheckoutForm } from "@/modules/orders/utils/checkout-validation";
import Button from "@/modules/storefront-shell/components/Button";
import StoreField, { FieldError, storeInputClass as inputClass } from "@/modules/storefront-shell/components/StoreField";
import { useStoreContact } from "@/modules/storefront-shell/hooks/useStoreContact";
import { SectionDecor } from "@/modules/storefront-shell/components/decor";
import { CheckIcon, LeafIcon, LockIcon } from "@/modules/storefront-shell/components/icons";
import { useFieldErrors, validateFields } from "@/shared/form-validation";
import { scrollToFirstError } from "@/shared/scrollToFirstError";

const STATE_OPTIONS = [
  "Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Telangana", "Delhi", "Uttar Pradesh", "Maharashtra", "Gujarat", "Goa",
];

const fieldsetClass = "m-0 flex min-w-0 flex-col gap-4 rounded-xl border border-ka-sand bg-white p-[clamp(18px,3vw,28px)]";
const legendClass = "float-left mb-1 w-full p-0 font-display text-2xl font-semibold text-ka-green";

/** Only ever used to skip typing through this form by hand while testing against Razorpay's test mode - shown only when NEXT_PUBLIC_CHECKOUT_SAMPLE_DATA is "true", and never once NEXT_PUBLIC_PAYMENT_MODE is "live". */
const SAMPLE_CHECKOUT_DATA: CheckoutForm = {
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
const showSampleDataButton = env.paymentMode === "test" && env.checkoutSampleData;

export default function CheckoutPage() {
  const router = useRouter();
  // isPending, not isLoading: the server has no guestId so its query is disabled - only isPending is true on both sides, keeping hydration in sync.
  const { data: cartRes, isPending: isLoading } = useCart();
  const cart = cartRes?.data;
  const { storeName } = useStoreContact();

  const [form, setForm] = useState<CheckoutForm>({
    name: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: STATE_OPTIONS[0]!, pincode: "", acceptedTerms: false,
  });
  const { errors, setErrors, clearError } = useFieldErrors();
  const set = (key: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    clearError(key);
  };

  const { mutateAsync: createOrder, isPending } = useMutation({ mutationFn: createOrderApi });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart) return;
    const validationErrors = validateFields(CHECKOUT_RULES, form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      scrollToFirstError();
      return;
    }
    const phone = normalizeIndianPhone(form.phone);

    try {
      const res = await createOrder({ guestId: getGuestId(), cartId: cart.id, ...form, phone });
      const order = res.data;
      if (!order) throw new Error("no order");

      const details = { storeName, prefill: { name: form.name, email: form.email, contact: phone } };
      const goToSuccess = (orderId: string) => router.push(`/checkout/success/${orderId}?guestId=${getGuestId()}`);

      if (env.paymentMode === "test") {
        openRazorpayCheckoutTestFunction(order, details, goToSuccess, (paymentResponse) => verifyPaymentApi(paymentResponse));
      } else {
        openRazorpayCheckoutFunction(order, details, goToSuccess);
      }
    } catch (err) {
      // The backend's own validation ({ errors: { field: msg } }) goes under the matching input, same as client-side errors.
      const inline = Object.fromEntries(Object.entries(getApiFieldErrors(err) ?? {}).filter(([key]) => key in form));
      if (Object.keys(inline).length > 0) {
        setErrors(inline);
        scrollToFirstError();
      } else {
        toast.error("Could not start checkout. Try again.");
      }
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
        {showSampleDataButton && (
          <Button
            type="button"
            variant="outline"
            className="ml-auto h-10! text-sm!"
            onClick={() => {
              setForm(SAMPLE_CHECKOUT_DATA);
              setErrors({});
            }}
          >
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
        <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-start gap-[clamp(24px,4vw,56px)]">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-7">
            <fieldset className={fieldsetClass}>
              <legend className={legendClass}>1. Contact</legend>
              <StoreField label="Full name" required error={errors.name}>
                <input autoComplete="name" maxLength={60} placeholder="e.g. Lakshmi Menon" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} className={inputClass} />
              </StoreField>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                <StoreField label="Phone (WhatsApp)" required error={errors.phone}>
                  <input
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+91 98XXX XXXXX"
                    value={form.phone}
                    onChange={set("phone")}
                    aria-invalid={!!errors.phone}
                    className={inputClass}
                  />
                </StoreField>
                <StoreField label="Email" required error={errors.email}>
                  <input
                    type="email"
                    autoComplete="email"
                    maxLength={100}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set("email")}
                    aria-invalid={!!errors.email}
                    className={inputClass}
                  />
                </StoreField>
              </div>
            </fieldset>

            <fieldset className={fieldsetClass}>
              <legend className={legendClass}>2. Delivery address</legend>
              <StoreField label="Pincode" required error={errors.pincode} className="max-w-[220px]">
                <input
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  placeholder="682001"
                  value={form.pincode}
                  onChange={set("pincode")}
                  aria-invalid={!!errors.pincode}
                  className={inputClass}
                />
              </StoreField>
              <StoreField label="Address" required error={errors.addressLine1}>
                <input
                  autoComplete="address-line1"
                  maxLength={120}
                  placeholder="House name, street"
                  value={form.addressLine1}
                  onChange={set("addressLine1")}
                  aria-invalid={!!errors.addressLine1}
                  className={inputClass}
                />
              </StoreField>
              <StoreField label="Landmark (optional)" error={errors.addressLine2}>
                <input
                  autoComplete="address-line2"
                  maxLength={120}
                  placeholder="Near…"
                  value={form.addressLine2}
                  onChange={set("addressLine2")}
                  aria-invalid={!!errors.addressLine2}
                  className={inputClass}
                />
              </StoreField>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                <StoreField label="City" required error={errors.city}>
                  <input autoComplete="address-level2" maxLength={60} placeholder="Kochi" value={form.city} onChange={set("city")} aria-invalid={!!errors.city} className={inputClass} />
                </StoreField>
                <StoreField label="State" required error={errors.state}>
                  <select autoComplete="address-level1" value={form.state} onChange={set("state")} aria-invalid={!!errors.state} className={inputClass}>
                    {STATE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </StoreField>
              </div>
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
            {/* Right above the button it unlocks, so an unticked box and its error are never off-screen from the click. */}
            <div className="mt-1 flex flex-col gap-1.5" data-invalid={!!errors.acceptedTerms || undefined}>
              <label className="flex items-start gap-2.5 text-[13.5px] leading-snug text-ka-ink">
                <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, acceptedTerms: e.target.checked }));
                    clearError("acceptedTerms");
                  }}
                  aria-invalid={!!errors.acceptedTerms}
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
              <FieldError message={errors.acceptedTerms} />
            </div>
            <Button type="submit" className="h-[54px]! text-[15.5px]!" loading={isPending} loadingText="Starting payment…">
              Place Order · {formatCurrency(cart.total)}
            </Button>
            <span className="flex items-center justify-center gap-2 text-center text-[12.5px] text-ka-body">
              <LockIcon size={14} strokeWidth={1.8} className="flex-none text-ka-green" />
              Secure payment via Razorpay · UPI, cards, net banking
            </span>
          </aside>
        </form>
      )}
    </section>
  );
}
