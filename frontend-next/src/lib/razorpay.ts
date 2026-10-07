import toast from "react-hot-toast";
import { env } from "./env";
import { DEFAULT_STORE_NAME } from "./contact";
import type { IRazorpayOptions, IRazorpayOrder } from "@/modules/orders/types/order.type";

declare global {
  interface Window {
    Razorpay: new (options: IRazorpayOptions) => { open: () => void; on: (event: string, cb: (r: unknown) => void) => void };
  }
}

const openRazorpayCheckout = (options: IRazorpayOptions) => {
  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", () => options.onPaymentFailed?.(null));
  rzp.open();
};

type RazorpayPaymentResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };

/** Live mode: relies on the backend's payment webhook to confirm the order. */
export const openRazorpayCheckoutFunction = (order: IRazorpayOrder, onHandle: (orderId: string) => void) => {
  if (!env.razorpayKeyId) return toast.error("Payment configuration error");
  openRazorpayCheckout({
    key: env.razorpayKeyId,
    amount: order.amount,
    currency: order.currency,
    name: DEFAULT_STORE_NAME,
    description: "Payment for order",
    order_id: order.id,
    notes: order.notes as Record<string, string>,
    handler: () => onHandle(String((order.notes as Record<string, string>).appOrderId)),
    prefill: { email: "user@example.com", contact: "9999999999" },
    onPaymentFailed: () => toast.error("Payment failed"),
  });
};

/** Test mode (NEXT_PUBLIC_PAYMENT_MODE=test): confirms via verify-payment right after the popup succeeds, bypassing the webhook - safe for local/staging. */
export const openRazorpayCheckoutTestFunction = (
  order: IRazorpayOrder,
  onHandle: (orderId: string) => void,
  onVerify: (paymentResponse: RazorpayPaymentResponse) => Promise<void>
) => {
  if (!env.razorpayTestKeyId) return toast.error("Payment configuration error");
  openRazorpayCheckout({
    key: env.razorpayTestKeyId,
    amount: order.amount,
    currency: order.currency,
    name: `${DEFAULT_STORE_NAME} [TEST]`,
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
    prefill: { email: "test@example.com", contact: "9999999999" },
    onPaymentFailed: () => toast.error("[TEST] Payment failed"),
  });
};
