"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminAsyncState from "@/modules/admin-shell/components/AdminAsyncState";
import AdminErrorBoundary from "@/modules/admin-shell/components/AdminErrorBoundary";
import Skeleton from "@/modules/admin-shell/components/Skeleton";
import AdminTable, { type AdminTableColumn } from "@/modules/admin-shell/components/AdminTable";
import FilterPills, { type FilterPillOption } from "@/modules/admin-shell/components/FilterPills";
import CustomDateRangeModal from "@/modules/admin-shell/components/CustomDateRangeModal";
import Pagination from "@/modules/admin-shell/components/Pagination";
import { barColor, whitePillButton } from "@/modules/admin-shell/style-helpers";
import { downloadCsv } from "@/modules/admin-shell/utils/csv";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAdminRevenueReportApi } from "@/modules/reports/api/reports.api";
import { useRevenueReport } from "@/modules/reports/hooks/useRevenueReport";
import type { DailyRevenueData, ReportDateRangeOption, RevenueGranularity, RevenueReportQuery } from "@/modules/reports/types/reports.type";

const RANGES: { key: ReportDateRangeOption; label: string }[] = [
  { key: "last_7_days", label: "Last 7 days" },
  { key: "this_week", label: "This week" },
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "this_year", label: "This year" },
  { key: "all_time", label: "All time" },
  { key: "custom", label: "Custom" },
];

const GRANULARITY_NOUN: Record<RevenueGranularity, string> = { day: "day", week: "week", month: "month" };

/** Bucket keys come back shaped for their granularity - a plain day
 * ("2026-09-14"), a week's Monday start date, or a bare month ("2026-09") -
 * each needs its own display format instead of one date formatter. */
function formatBucketLabel(dateStr: string, granularity: RevenueGranularity): string {
  if (granularity === "month") {
    const [y, m] = dateStr.split("-").map(Number);
    return new Date(y!, m! - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }
  if (granularity === "week") {
    const start = new Date(dateStr);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${fmt(start)} – ${fmt(end)}`;
  }
  return formatDate(dateStr);
}

function buildColumns(granularity: RevenueGranularity): AdminTableColumn<DailyRevenueData>[] {
  return [
    { key: "date", header: "Date", render: (r) => <span className="text-[12.5px] font-semibold">{formatBucketLabel(r.date, granularity)}</span> },
    { key: "orders", header: "Orders", align: "right", render: (r) => <span className="text-[12.5px]">{r.orders}</span> },
    { key: "revenue", header: "Revenue", align: "right", render: (r) => <span className="text-[12.5px] font-semibold">{formatCurrency(r.revenue)}</span> },
    {
      key: "avg",
      header: "Avg. order value",
      align: "right",
      render: (r) => <span className="text-[12.5px] text-[#555]">{formatCurrency(r.orders ? r.revenue / r.orders : 0)}</span>,
    },
  ];
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function RevenueOverviewSkeleton() {
  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-4 om:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <AdminCard key={i} padding="18px 20px">
            <Skeleton className="mb-3 h-3 w-24" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="mt-2 h-2.5 w-16" />
          </AdminCard>
        ))}
      </div>

      <AdminCard padding="22px 24px" className="mb-4">
        <Skeleton className="mb-3.5 h-3 w-36" />
        <div className="flex h-[180px] items-end gap-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="flex-1" style={{ height: `${20 + ((i * 17) % 70)}%` }} />
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <Skeleton className="mb-3 h-3 w-40" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </AdminCard>
    </>
  );
}

export default function RevenuePage() {
  const [range, setRange] = useState<ReportDateRangeOption>("this_month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [view, setView] = useState<"overview" | "detail">("overview");
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(25);
  const [exportingDetail, setExportingDetail] = useState(false);

  useEffect(() => setDetailPage(1), [range, customFrom, customTo]);

  // Clicking "Custom" only opens the picker - range doesn't switch to
  // "custom" until Apply commits a real from/to pair, so Cancel leaves
  // whatever preset was active untouched instead of stranding the page on
  // an empty custom range.
  const handleRangeChange = (next: ReportDateRangeOption) => {
    if (next === "custom") {
      setCustomModalOpen(true);
      return;
    }
    setRange(next);
    setCustomFrom("");
    setCustomTo("");
  };

  const customRangeLabel = customFrom && customTo ? `${shortDate(customFrom)} – ${shortDate(customTo)}` : "Custom";
  const rangeOptions: FilterPillOption<ReportDateRangeOption>[] = RANGES.map((r) =>
    r.key === "custom" ? { value: r.key, label: customRangeLabel } : { value: r.key, label: r.label }
  );

  const rangeReady = range !== "custom" || (!!customFrom && !!customTo);
  const baseQuery: RevenueReportQuery =
    range === "custom" ? { option: range, customStartDate: customFrom, customEndDate: customTo } : { option: range };

  const { data, isLoading, isError, refetch } = useRevenueReport(baseQuery, rangeReady);
  const {
    data: detailData,
    isLoading: detailLoading,
    isError: detailIsError,
    refetch: refetchDetail,
  } = useRevenueReport({ ...baseQuery, detail: true, page: detailPage, limit: detailPageSize }, rangeReady && view === "detail");

  const summary = data?.data.summary;
  const rows = data?.data.dailyData ?? [];
  const granularity = data?.data.granularity ?? "day";
  const maxRev = Math.max(1, ...rows.map((r) => r.revenue));
  const rangeLabel = range === "custom" ? customRangeLabel : RANGES.find((r) => r.key === range)?.label ?? "";

  const exportDetailCsv = async () => {
    setExportingDetail(true);
    try {
      // No page/limit - the backend returns every day in the range in one
      // shot, same as the overview, rather than whatever page happens to be
      // showing.
      const res = await getAdminRevenueReportApi({ ...baseQuery, detail: true });
      const all = res.data.dailyData;
      downloadCsv("artspace-revenue-full.csv", ["Date", "Orders", "Revenue"], all.map((r) => [r.date, r.orders, r.revenue]));
    } finally {
      setExportingDetail(false);
    }
  };

  return (
    <AdminPageShell
      title="Revenue"
      subtitle={view === "overview" ? "Sales performance with adaptive breakdown" : `Full day-by-day breakdown · ${rangeLabel}`}
    >
      <div className="mb-5">
        <FilterPills options={rangeOptions} value={range} onChange={handleRangeChange} />
      </div>

      {customModalOpen && (
        <CustomDateRangeModal
          from={customFrom}
          to={customTo}
          onApply={(f, t) => {
            setRange("custom");
            setCustomFrom(f);
            setCustomTo(t);
            setCustomModalOpen(false);
          }}
          onClose={() => setCustomModalOpen(false)}
        />
      )}

      {!rangeReady ? (
        <AdminCard>
          <div className="py-10 text-center text-sm text-[#8a8a8e]">Pick a start and end date to see revenue for a custom range.</div>
        </AdminCard>
      ) : view === "overview" ? (
        <AdminAsyncState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          skeleton={<RevenueOverviewSkeleton />}
          errorTitle="Revenue data unavailable"
        >
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 om:grid-cols-3">
              {summary && (
                <>
                  {[
                    { label: "Total Revenue", value: formatCurrency(summary.totalRevenue), sub: rangeLabel },
                    { label: "Total Orders", value: String(summary.totalOrders), sub: rangeLabel },
                    { label: "Avg. Order Value", value: formatCurrency(summary.averageOrderValue), sub: "Per order" },
                  ].map((k) => (
                    <AdminCard key={k.label} padding="18px 20px">
                      <div className="mb-3 text-[12.5px] font-semibold">{k.label}</div>
                      <div className="text-[30px] font-bold tracking-[-.03em]">{k.value}</div>
                      <div className="mt-0.5 text-[10.5px] text-[#8a8a8e]">{k.sub}</div>
                    </AdminCard>
                  ))}
                </>
              )}
            </div>

            <AdminCard padding="22px 24px" className="mb-4">
              <div className="mb-3.5 flex items-baseline justify-between">
                <div className="text-[13px] font-semibold">Revenue by {GRANULARITY_NOUN[granularity]}</div>
              </div>
              <div className="flex h-[180px] items-end gap-1">
                {rows.map((r) => (
                  <div
                    key={r.date}
                    title={`${formatBucketLabel(r.date, granularity)}: ${formatCurrency(r.revenue)}`}
                    className="flex-1 rounded-t"
                    style={{ height: `${Math.max(2, (r.revenue / maxRev) * 100)}%`, background: barColor(r.revenue, maxRev) }}
                  />
                ))}
              </div>
              {rows.length > 0 && (
                <div className="mt-2 flex justify-between text-[11px] text-[#8a8a8e]">
                  <span>{formatBucketLabel(rows[0]!.date, granularity)}</span>
                  <span>{formatBucketLabel(rows[rows.length - 1]!.date, granularity)}</span>
                </div>
              )}
            </AdminCard>

            <AdminCard>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[13px] font-semibold">{GRANULARITY_NOUN[granularity]}-by-{GRANULARITY_NOUN[granularity]} breakdown</div>
                <button style={whitePillButton} onClick={() => setView("detail")}>
                  View full breakdown →
                </button>
              </div>
              <AdminTable
                columns={buildColumns(granularity)}
                rows={[...rows].reverse()}
                getRowKey={(r) => r.date}
                minWidth={520}
                compact
                emptyMessage="No revenue in this range."
              />
            </AdminCard>
          </>
        </AdminAsyncState>
      ) : (
        <AdminCard>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <button style={{ ...whitePillButton, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => setView("overview")}>
              <ArrowLeft size={14} /> Back to overview
            </button>
            <button
              style={{ ...whitePillButton, display: "inline-flex", alignItems: "center", gap: 8 }}
              onClick={exportDetailCsv}
              disabled={exportingDetail}
            >
              <Download size={14} /> {exportingDetail ? "Preparing…" : "Export CSV"}
            </button>
          </div>
          <AdminErrorBoundary>
            <AdminTable
              columns={buildColumns("day")}
              rows={detailData?.data.dailyData ?? []}
              getRowKey={(r) => r.date}
              minWidth={520}
              compact
              isLoading={detailLoading}
              isError={detailIsError}
              onRetry={refetchDetail}
              errorMessage="Breakdown couldn't load."
              emptyMessage="No revenue in this range."
            />
          </AdminErrorBoundary>
          <Pagination
            page={detailPage}
            totalPages={detailData?.totalPages ?? 1}
            total={detailData?.total}
            pageSize={detailPageSize}
            onPageChange={setDetailPage}
            onPageSizeChange={setDetailPageSize}
          />
        </AdminCard>
      )}
    </AdminPageShell>
  );
}
