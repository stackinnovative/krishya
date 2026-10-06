"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, LayoutDashboard, RotateCcw } from "lucide-react";
import { blackPillButton, whitePillButton } from "@/modules/admin-shell/style-helpers";

/**
 * Last-resort net for the /admin/* segment - only reached if something
 * escapes every per-widget AdminErrorBoundary (see admin-shell). Styled to
 * match not-found.tsx so the two "whole page is gone" states feel the same.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1d1d1f] px-4 py-10">
      <div className="w-full max-w-[440px] rounded-[28px] bg-[#f1f1ef] p-8 text-center sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fde8e4]">
          <AlertTriangle size={28} strokeWidth={1.7} color="#e5533f" />
        </div>

        <div className="text-[13px] font-bold tracking-[.14em] text-[#b8b8b3]">ERROR</div>
        <h1 className="mt-2 text-[26px] font-extrabold text-[#141414] sm:text-[30px]">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-[320px] text-[13.5px] leading-relaxed text-[#6b6b68]">
          This page hit an unexpected error. You can try again, or head back to the dashboard.
        </p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button onClick={reset} style={whitePillButton} className="inline-flex items-center justify-center gap-2 px-6 py-3">
            <RotateCcw size={15} strokeWidth={2} />
            Try again
          </button>
          <Link href="/admin/dashboard" style={blackPillButton} className="inline-flex items-center justify-center gap-2 px-6 py-3">
            <LayoutDashboard size={15} strokeWidth={2} />
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
