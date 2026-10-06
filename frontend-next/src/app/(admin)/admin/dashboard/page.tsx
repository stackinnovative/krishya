"use client";

import { useState } from "react";
import Link from "next/link";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import { pill, whitePillButton } from "@/modules/admin-shell/style-helpers";
import RevenueHeroCard from "@/modules/dashboard/components/RevenueHeroCard";
import TopProductsCard from "@/modules/dashboard/components/TopProductsCard";
import KpiMetricsGrid from "@/modules/dashboard/components/KpiMetricsGrid";
import OrderStatusDonutCard from "@/modules/dashboard/components/OrderStatusDonutCard";
import RecentOrdersCard from "@/modules/dashboard/components/RecentOrdersCard";
import type { RevenueRange } from "@/modules/dashboard/types/dashboard.type";

const RANGES: { key: RevenueRange; label: string }[] = [
  { key: "Week", label: "Last 7 days" },
  { key: "Month", label: "Last 30 days" },
  { key: "Year", label: "Last year" },
];

/**
 * Each section below (RevenueHeroCard, TopProductsCard, KpiMetricsGrid,
 * OrderStatusDonutCard, RecentOrdersCard) fetches its own data and owns its
 * own loading/error state, so one failing/slow widget never blanks the
 * others - see AdminAsyncState/AdminErrorBoundary in admin-shell.
 */
export default function AdminDashboardPage() {
  const [range, setRange] = useState<RevenueRange>("Month");

  return (
    <AdminPageShell title="Dashboard" subtitle="Everything happening in your store today">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <button key={r.key} style={pill(range === r.key)} onClick={() => setRange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
        <Link href="/admin/revenue" style={whitePillButton}>
          View full report
        </Link>
      </div>

      <div className="mb-3 text-[15px] font-semibold">Overview</div>
      <div className="mb-[26px] grid grid-cols-1 gap-4 om:grid-cols-[1fr_320px]">
        <RevenueHeroCard range={range} />
        <TopProductsCard />
      </div>

      <div className="mb-3 text-[15px] font-semibold">Metrics</div>
      <div className="mb-[26px]">
        <KpiMetricsGrid />
      </div>

      <div className="mb-3 text-[15px] font-semibold">Orders</div>
      <div className="grid grid-cols-1 gap-4 om:grid-cols-[320px_1fr]">
        <OrderStatusDonutCard />
        <RecentOrdersCard />
      </div>
    </AdminPageShell>
  );
}
