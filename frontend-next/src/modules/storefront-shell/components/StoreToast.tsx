"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { CheckIcon } from "./icons";

type StoreToastOptions = { title: string; detail?: string; showCartLink?: boolean };

/**
 * The design's confirmation toast (green card, gold tick, optional "View cart"
 * link), shown bottom-centre above the mobile tab bar. Uses the app's single
 * react-hot-toast <Toaster> with a per-toast position, so admin toasts are
 * untouched.
 */
export function showStoreToast({ title, detail, showCartLink = false }: StoreToastOptions) {
  toast.custom(
    (t) => (
      <div
        role="status"
        className={`animate-ka-toast mb-[76px] flex w-max max-w-[calc(100vw-32px)] items-center gap-3.5 rounded-xl bg-ka-green py-3 pl-4 pr-3 font-body text-ka-cream shadow-[0_20px_40px_-16px_rgba(0,0,0,.45)] ka:mb-2 ${t.visible ? "" : "opacity-0"}`}
      >
        <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-full bg-ka-gold text-ka-green">
          <CheckIcon size={16} strokeWidth={2.2} />
        </span>
        <span className="flex min-w-0 flex-col gap-px">
          <span className="text-sm font-semibold">{title}</span>
          {detail && <span className="truncate text-[12.5px] text-ka-cream/80">{detail}</span>}
        </span>
        {showCartLink && (
          <Link
            href="/cart"
            onClick={() => toast.dismiss(t.id)}
            className="flex h-9 flex-none items-center rounded-lg border border-ka-gold/80 px-3.5 text-[13px] font-semibold text-ka-cream hover:bg-ka-gold/20"
          >
            View cart
          </Link>
        )}
      </div>
    ),
    { position: "bottom-center", duration: 3200 },
  );
}
