"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, ArrowLeft, LayoutDashboard } from "lucide-react";
import { blackPillButton, whitePillButton } from "@/modules/admin-shell/style-helpers";
import { ADMIN_NAV } from "@/modules/admin-shell/registry";

/**
 * Scoped to /admin/* only (this file lives inside the (admin)/admin
 * segment, next to its layout.tsx) - the storefront keeps its own
 * not-found.tsx separately since its design changes per client.
 */
export default function AdminNotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1d1d1f] px-4 py-10">
      <div className="w-full max-w-[440px] rounded-[28px] bg-[#f1f1ef] p-8 text-center sm:p-10">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg,#d9b25a,#f5e2a0 60%,#c69a3a)" }}
        >
          <Compass size={28} strokeWidth={1.7} color="#141414" />
        </div>

        <div className="text-[13px] font-bold tracking-[.14em] text-[#b8b8b3]">ERROR 404</div>
        <h1 className="mt-2 text-[26px] font-extrabold text-[#141414] sm:text-[30px]">Page not found</h1>
        <p className="mx-auto mt-3 max-w-[320px] text-[13.5px] leading-relaxed text-[#6b6b68]">
          The admin page you&apos;re looking for doesn&apos;t exist, was moved, or the link is mistyped.
        </p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => router.back()} style={whitePillButton} className="inline-flex items-center justify-center gap-2 px-6 py-3">
            <ArrowLeft size={15} strokeWidth={2} />
            Go back
          </button>
          <Link href="/admin/dashboard" style={blackPillButton} className="inline-flex items-center justify-center gap-2 px-6 py-3">
            <LayoutDashboard size={15} strokeWidth={2} />
            Go to dashboard
          </Link>
        </div>

        <div className="mt-8 border-t border-[#e2e2df] pt-6">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[.08em] text-[#a3a39e]">Quick links</div>
          <div className="flex flex-wrap justify-center gap-2">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-full border border-[#e6e6e3] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#141414] transition-colors hover:bg-[#eeeeec]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
