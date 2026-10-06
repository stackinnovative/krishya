"use client";

import Link from "next/link";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminAsyncState from "@/modules/admin-shell/components/AdminAsyncState";
import Skeleton from "@/modules/admin-shell/components/Skeleton";
import { useProductRankings } from "@/modules/dashboard/hooks/useDashboard";

function TopProductsSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 p-1.5">
          <Skeleton className="h-8 w-8 flex-none rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

export default function TopProductsCard() {
  const { data, isLoading, isError, refetch } = useProductRankings();
  const products = data?.data?.topSelling.products ?? [];

  return (
    <AdminCard padding="20px 20px 12px">
      <div className="mb-3.5 text-[13px] font-semibold">Top Selling Products</div>
      <AdminAsyncState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        skeleton={<TopProductsSkeleton />}
        errorTitle="Top products unavailable"
        compact
      >
        <div className="flex flex-col">
          {products.slice(0, 5).map((p) => (
            <Link key={p.productId} href={`/admin/products?id=${p.productId}`} className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-[#f5f5f3]">
              <div className="h-8 w-8 flex-none rounded-full bg-[#f1f1ef] bg-cover bg-center" style={{ backgroundImage: `url(${p.iconUrl})` }} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold">{p.name}</div>
              </div>
              <div className="text-xs font-semibold text-[#3fbf5f]">{p.totalQuantitySold} sold</div>
            </Link>
          ))}
          {!products.length && <div className="py-4 text-center text-xs text-[#8a8a8e]">No sales yet.</div>}
        </div>
      </AdminAsyncState>
    </AdminCard>
  );
}
