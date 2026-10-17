import toast from "react-hot-toast";
import { env } from "./env";
import type { IRazorpayOptions, IRazorpayOrder } from "@/modules/orders/types/order.type";

declare global {
  interface Window {
    Razorpay: new (options: IRazorpayOptions) => { open: () => void; on: (event: string, cb: (r: unknown) => void) => void };
  }
}

const openRazorpayCheckout = (options: IRazorpayOptions) => {
  // checkout.js loads after the page is interactive - a very quick click (or a blocked script) would otherwise throw here.
  if (typeof window.Razorpay === "undefined") return toast.error("Payment window is still loading. Please try again.");
  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", () => options.onPaymentFailed?.(null));
  rzp.open();
};

type RazorpayPaymentResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };

/** Shown in the Razorpay window: the store name from Business Settings and the shopper's own checkout details. */
export type RazorpayCheckoutDetails = { storeName: string; prefill: { name: string; email: string; contact: string } };

/** Live mode: relies on the backend's payment webhook to confirm the order. */
export const openRazorpayCheckoutFunction = (order: IRazorpayOrder, details: RazorpayCheckoutDetails, onHandle: (orderId: string) => void) => {
  if (!env.razorpayKeyId) return toast.error("Payment configuration error");
  openRazorpayCheckout({
    key: env.razorpayKeyId,
    amount: order.amount,
    currency: order.currency,
    name: details.storeName,
    description: "Payment for order",
    order_id: order.id,
    notes: order.notes as Record<string, string>,
    handler: () => onHandle(String((order.notes as Record<string, string>).appOrderId)),
    prefill: details.prefill,
    onPaymentFailed: () => toast.error("Payment failed"),
  });
};

/** Test mode (NEXT_PUBLIC_PAYMENT_MODE=test): confirms via verify-payment right after the popup succeeds, bypassing the webhook - safe for local/staging. */
export const openRazorpayCheckoutTestFunction = (
  order: IRazorpayOrder,
  details: RazorpayCheckoutDetails,
  onHandle: (orderId: string) => void,
  onVerify: (paymentResponse: RazorpayPaymentResponse) => Promise<void>
) => {
  if (!env.razorpayTestKeyId) return toast.error("Payment configuration error");
  openRazorpayCheckout({
    key: env.razorpayTestKeyId,
    amount: order.amount,
    currency: order.currency,
    name: `${details.storeName} [TEST]`,
    description: "Payment for order",
    order_id: order.id,
    notes: order.notes as Record<string, string>,
    handler: async (response) => {
      try {
        await onVerify(response);
        onHandle(String((order.notes as Record<string, string>).appOrderId));
      } catch {
        toast.error("Payment verification failed");
      }
    },
    prefill: details.prefill,
    onPaymentFailed: () => toast.error("[TEST] Payment failed"),
  });
};
