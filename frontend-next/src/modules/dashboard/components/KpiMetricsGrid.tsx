"use client";

import Link from "next/link";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminAsyncState from "@/modules/admin-shell/components/AdminAsyncState";
import Skeleton from "@/modules/admin-shell/components/Skeleton";
import { delta } from "@/modules/admin-shell/style-helpers";
import { useKpiCards } from "@/modules/dashboard/hooks/useDashboard";

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 om:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <AdminCard key={i} padding="18px 20px">
          <Skeleton className="mb-3.5 h-3 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="mt-2 h-2.5 w-16" />
        </AdminCard>
      ))}
    </div>
  );
}

export default function KpiMetricsGrid() {
  const { data, isLoading, isError, refetch } = useKpiCards();
  const cards = data?.data ?? [];

  return (
    <AdminAsyncState isLoading={isLoading} isError={isError} onRetry={refetch} skeleton={<KpiSkeleton />} errorTitle="Metrics unavailable">
      <div className="grid grid-cols-2 gap-4 om:grid-cols-4">
        {cards.map((m) => {
          const d = m.trend ? delta(m.trend.direction === "up" ? m.trend.percentageChange : -m.trend.percentageChange) : null;
          return (
            <AdminCard key={m.key} padding="18px 20px" className="cursor-pointer">
              <Link href={m.action?.href ?? "#"}>
                <div className="mb-3.5 text-[12.5px] font-semibold">{m.label}</div>
                <div className="flex items-center gap-2">
                  <div className="text-[30px] font-bold tracking-[-.03em]">{m.formattedValue}</div>
                  {d && <span style={d.style}>{d.text}</span>}
                </div>
                <div className="mt-0.5 text-[10.5px] text-[#8a8a8e]">{m.action?.label ?? ""}</div>
              </Link>
            </AdminCard>
          );
        })}
      </div>
    </AdminAsyncState>
  );
}
