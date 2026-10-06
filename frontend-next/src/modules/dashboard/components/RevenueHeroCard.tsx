"use client";

import { formatCurrency } from "@/lib/format";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminAsyncState from "@/modules/admin-shell/components/AdminAsyncState";
import Skeleton from "@/modules/admin-shell/components/Skeleton";
import { barColor } from "@/modules/admin-shell/style-helpers";
import { useMotivationSummary, useRevenueChart } from "@/modules/dashboard/hooks/useDashboard";
import type { RevenueRange } from "@/modules/dashboard/types/dashboard.type";

const RANGE_LABEL: Record<RevenueRange, string> = { Daily: "Today", Week: "Last 7 days", Month: "Last 30 days", Year: "Last year" };

function RevenueHeroSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-2.5 h-3 w-28" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-[38px] w-full rounded-full" />
      <div className="rounded-2xl bg-[#f7f7f5] px-[18px] pb-3.5 pt-4">
        <Skeleton className="mb-3.5 h-3 w-32" />
        <div className="flex h-24 items-end gap-[3px]">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton key={i} className="flex-1" style={{ height: `${30 + ((i * 13) % 60)}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RevenueHeroCard({ range }: { range: RevenueRange }) {
  const motivation = useMotivationSummary();
  const revenueChart = useRevenueChart(range);

  const bars = revenueChart.data?.data?.series.data ?? [];
  const maxBar = Math.max(1, ...bars);
  const targetPct = motivation.data?.data?.target?.progressPercentage ?? 0;

  return (
    <AdminCard padding="22px 24px">
      <AdminAsyncState
        isLoading={motivation.isLoading || revenueChart.isLoading}
        isError={motivation.isError || revenueChart.isError}
        onRetry={() => {
          motivation.refetch();
          revenueChart.refetch();
        }}
        skeleton={<RevenueHeroSkeleton />}
        errorTitle="Revenue overview unavailable"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[36px] font-bold leading-none tracking-[-.03em]">
                {motivation.data?.data?.metric.formatted ?? "—"}
              </div>
              <div className="mt-1.5 text-[11px] text-[#8a8a8e]">Revenue · {RANGE_LABEL[range]}</div>
            </div>
            <div className="text-xs text-[#8a8a8e]">
              <span className="font-bold text-[#3fbf5f]">{targetPct}%</span> of monthly target
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative h-[38px] flex-1 overflow-hidden rounded-full bg-[#f3f3f1]">
              <div
                className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap rounded-full pl-4 text-[12.5px] font-semibold text-[#1d1d1f]"
                style={{ background: "linear-gradient(90deg,#f7a072,#f8d77a 50%,#b5e36e)", width: `${Math.min(100, targetPct)}%` }}
              >
                Target progress
              </div>
            </div>
            <div className="rounded-full bg-[#f3f3f1] px-4 py-2.5 text-[12.5px] font-semibold">
              {motivation.data?.data?.target ? formatCurrency(motivation.data.data.target.value) + " goal" : "—"}
            </div>
          </div>
          <div className="rounded-2xl bg-[#f7f7f5] px-[18px] pb-3.5 pt-4">
            <div className="mb-2.5 flex justify-between text-[11px] text-[#8a8a8e]">
              <div className="flex gap-3">
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#f7a072]" />Low</span>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#f8d77a]" />Mid</span>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#b5e36e]" />High</span>
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="hidden flex-none text-[19px] font-semibold leading-[1.15] xs:block">
                Sales
                <br />
                Over Time
              </div>
              <div className="flex h-24 flex-1 items-end gap-[3px]">
                {bars.map((v, i) => (
                  <div
                    key={i}
                    title={revenueChart.data?.data?.categories[i]}
                    className="flex-1 rounded-sm"
                    style={{ height: `${Math.max(4, (v / maxBar) * 100)}%`, background: barColor(v, maxBar) }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminAsyncState>
    </AdminCard>
  );
}
