"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthUser } from "../hooks/useAuthUser";

/**
 * Client-side admin route gate. The API and this app live on different
 * domains (see NEXTJS_MIGRATION_PLAN.md), so the httpOnly session cookie
 * can't be read in Next.js middleware - gating stays client-side, same as
 * the current SPA's AdminBootstrap, with the backend as the real
 * enforcement point on every request.
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/admin/login?from=${redirect}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1d1d1f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return <>{children}</>;
}
