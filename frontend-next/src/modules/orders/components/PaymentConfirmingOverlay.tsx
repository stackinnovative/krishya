"use client";

import { useEffect } from "react";
import Spinner from "@/shared/ui/Spinner";
import { LockIcon } from "@/modules/storefront-shell/components/icons";

/**
 * Full-screen cover shown between Razorpay reporting success and the
 * success page taking over (payment verification + route load), so the
 * shopper never sees the checkout form sitting idle after paying. Unmounts
 * with the checkout page once the navigation lands.
 */
export default function PaymentConfirmingOverlay() {
  // Lock page scroll behind the overlay; restored when it unmounts.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ka-cream/85 px-6 backdrop-blur-sm"
    >
      <div className="animate-fade-up flex w-full max-w-[360px] flex-col items-center gap-5 text-center">
        <span className="relative grid h-[76px] w-[76px] place-items-center text-ka-green">
          <Spinner size={76} />
          <LockIcon size={22} className="absolute inset-0 m-auto" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="m-0 font-display text-[clamp(26px,6vw,32px)] font-medium leading-[1.15] text-ka-green">Confirming your payment</h2>
          <p className="m-0 text-[14.5px] leading-[1.55] text-ka-body">This takes just a moment. Please don&apos;t close or refresh this page.</p>
        </div>
      </div>
    </div>
  );
}
