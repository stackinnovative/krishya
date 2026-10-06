"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { getGuestId } from "@/lib/guest";
import { env } from "@/lib/env";
import { openRazorpayCheckoutFunction, openRazorpayCheckoutTestFunction } from "@/lib/razorpay";
import { useCart } from "@/modules/cart/hooks/useCart";
import { createOrderApi, verifyPaymentApi } from "@/modules/orders/api/order.api";
import Button from "@/modules/storefront-shell/components/Button";

const STATE_OPTIONS = [
  "Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Telangana", "Delhi", "Uttar Pradesh", "Maharashtra", "Gujarat", "Goa",
];

const inputClass = "w-full rounded-xl border px-4 py-2.5 text-sm outline-none";

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
  const { data: cartRes } = useCart();
  const cart = cartRes?.data;

  const [form, setForm] = useState({
    name: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: STATE_OPTIONS[0]!, pincode: "", acceptedTerms: false,
  });

  const { mutateAsync: createOrder, isPending } = useMutation({ mutationFn: createOrderApi });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart) return;
    if (!form.acceptedTerms) return toast.error("Please accept the terms to continue.");

    try {
      const res = await createOrder({ guestId: getGuestId(), cartId: cart.id, ...form });
      const order = res.data;
      if (!order) throw new Error("no order");

      const goToSuccess = (orderId: string) => router.push(`/checkout/success/${orderId}?guestId=${getGuestId()}`);

      if (env.paymentMode === "test") {
        openRazorpayCheckoutTestFunction(order, goToSuccess, (paymentResponse) => verifyPaymentApi(paymentResponse));
      } else {
        openRazorpayCheckoutFunction(order, goToSuccess);
      }
    } catch {
      toast.error("Could not start checkout. Try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold">Checkout</h1>
        {env.paymentMode === "test" && (
          <Button type="button" variant="outline" className="flex-none" onClick={() => setForm(SAMPLE_CHECKOUT_DATA)}>
            Fill sample data
          </Button>
        )}
      </div>

      {!cart || cart.items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Your cart is empty.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} style={{ borderColor: "var(--border)" }} />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} style={{ borderColor: "var(--border)" }} />
          <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} style={{ borderColor: "var(--border)" }} />
          <input required placeholder="Address line 1" value={form.addressLine1} onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))} className={inputClass} style={{ borderColor: "var(--border)" }} />
          <input placeholder="Address line 2 (optional)" value={form.addressLine2} onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))} className={inputClass} style={{ borderColor: "var(--border)" }} />
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputClass} style={{ borderColor: "var(--border)" }} />
            <input required placeholder="Pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} className={inputClass} style={{ borderColor: "var(--border)" }} />
          </div>
          <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className={inputClass} style={{ borderColor: "var(--border)" }}>
            {STATE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.acceptedTerms} onChange={(e) => setForm((f) => ({ ...f, acceptedTerms: e.target.checked }))} />
            I accept the terms &amp; conditions
          </label>

          <div className="mt-3 rounded-xl p-3.5 text-sm" style={{ background: "var(--bg-secondary)" }}>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{cart.totalPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span>Delivery</span>
              <span>{cart.deliveryCharge ? `₹${cart.deliveryCharge.toLocaleString("en-IN")}` : "Free"}</span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold" style={{ borderColor: "var(--border)" }}>
              <span>Total</span>
              <span>₹{cart.total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <Button type="submit" className="mt-2" loading={isPending} loadingText="Starting payment…">
            Pay & place order
          </Button>
        </form>
      )}
    </div>
  );
}
