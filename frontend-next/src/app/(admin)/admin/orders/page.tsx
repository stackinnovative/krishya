"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminErrorBoundary from "@/modules/admin-shell/components/AdminErrorBoundary";
import AdminListFilterRow from "@/modules/admin-shell/components/AdminListFilterRow";
import SearchableSelect from "@/modules/admin-shell/components/SearchableSelect";
import DateRangeFilter from "@/modules/admin-shell/components/DateRangeFilter";
import FilterPills, { type FilterPillOption } from "@/modules/admin-shell/components/FilterPills";
import Pagination from "@/modules/admin-shell/components/Pagination";
import AdminTable, { type AdminTableColumn } from "@/modules/admin-shell/components/AdminTable";
import TruncatedText from "@/modules/admin-shell/components/TruncatedText";
import { whitePillButton } from "@/modules/admin-shell/style-helpers";
import { downloadCsv } from "@/modules/admin-shell/utils/csv";
import { formatDate } from "@/lib/format";
import { useAdminOrders } from "@/modules/orders/hooks/useAdminOrders";
import { ORDER_STATUS_LABEL } from "@/modules/orders/utils/order-status";
import type { AdminOrderListItem, OrderStatus } from "@/modules/orders/types/order.type";
import OrderDetailModal from "@/modules/orders/components/OrderDetailModal";
import OrderStatusDropdown from "@/modules/orders/components/OrderStatusDropdown";

const FILTERS: ("All" | OrderStatus)[] = ["All", "created", "confirmed", "accepted", "dispatched", "delivered", "cancelled"];
const FILTER_OPTIONS: FilterPillOption<"All" | OrderStatus>[] = FILTERS.map((f) => ({
  value: f,
  label: f === "All" ? "All" : ORDER_STATUS_LABEL[f],
}));

const ORDER_SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price: Low to High", value: "price_low_high" },
  { label: "Price: High to Low", value: "price_high_low" },
] as const;
type OrderSortValue = (typeof ORDER_SORT_OPTIONS)[number]["value"];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [sort, setSort] = useState<OrderSortValue>("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  useEffect(() => setPage(1), [search, filter, sort, dateFrom, dateTo]);

  const query: Record<string, unknown> = { search, page, limit: pageSize, sort };
  if (filter !== "All") query.orderStatus = filter;
  if (dateFrom) query.dateFrom = dateFrom;
  if (dateTo) query.dateTo = dateTo;

  const { data, isLoading, isError, refetch } = useAdminOrders(query);
  const orders = data?.data ?? [];

  const columns: AdminTableColumn<AdminOrderListItem>[] = [
    { key: "order", header: "Order", width: 110, render: (o) => <TruncatedText text={o.orderNumber} className="text-[13px] font-semibold" /> },
    {
      key: "customer",
      header: "Customer",
      width: 180,
      render: (o) => (
        <div className="min-w-0 text-[12.5px]">
          <TruncatedText text={o.customerName} />
          <TruncatedText text={o.customerPhone} className="text-[11px] text-[#8a8a8e]" />
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      width: 110,
      cellClassName: "whitespace-nowrap",
      render: (o) => <span className="text-[12.5px] text-[#555]">{formatDate(o.createdAt)}</span>,
    },
    { key: "items", header: "Items", width: 70, render: (o) => <span className="text-[12.5px]">{o.itemsCount}</span> },
    {
      key: "total",
      header: "Total",
      width: 100,
      render: (o) => <span className="text-[12.5px] font-semibold">₹{o.totalAmount.toLocaleString("en-IN")}</span>,
    },
    { key: "status", header: "Status", width: 140, render: (o) => <OrderStatusDropdown orderId={o.id} status={o.orderStatus} /> },
    { key: "manage", header: "", align: "right", width: 90, render: () => <span className="text-xs font-semibold text-[#8a8a8e]">Manage →</span> },
  ];

  const exportCsv = () => {
    downloadCsv(
      "artspace-orders.csv",
      ["Order Number", "Customer Name", "Customer Phone", "Date", "Items", "Total", "Status"],
      orders.map((o) => [o.orderNumber, o.customerName, o.customerPhone, formatDate(o.createdAt), o.itemsCount, o.totalAmount, ORDER_STATUS_LABEL[o.orderStatus]]),
    );
  };

  return (
    <AdminPageShell
      title="Orders"
      subtitle="See every order and update status as you fulfil"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by order number or customer name"
      sortOptions={[...ORDER_SORT_OPTIONS]}
      sortValue={sort}
      onSortChange={(v) => setSort(v as OrderSortValue)}
    >
      <AdminListFilterRow
        filters={<FilterPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />}
        right={
          <>
            <DateRangeFilter from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); }} />
            <div className="hidden w-40 om:block">
              <SearchableSelect options={[...ORDER_SORT_OPTIONS]} value={sort} onChange={(v) => setSort(v as OrderSortValue)} searchable={false} placeholder="Sort" />
            </div>
          </>
        }
      />

      <AdminCard>
        <div className="mb-3 flex justify-end">
          <button style={{ ...whitePillButton, display: "inline-flex", alignItems: "center", gap: 8 }} onClick={exportCsv}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        <AdminErrorBoundary>
          <AdminTable
            columns={columns}
            rows={orders}
            getRowKey={(o) => o.id}
            minWidth={800}
            onRowClick={(o) => setOpenOrderId(o.id)}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            errorMessage="Orders couldn't load."
            emptyMessage="No orders here."
            renderMobileCard={(o) => (
              <div onClick={() => setOpenOrderId(o.id)} className="rounded-2xl border border-[#f0f0ee] p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[13.5px] font-bold">{o.orderNumber}</div>
                    <div className="text-[12px] text-[#555]">{o.customerName}</div>
                  </div>
                  <OrderStatusDropdown orderId={o.id} status={o.orderStatus} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[12.5px] text-[#8a8a8e]">
                  <span>{formatDate(o.createdAt)} · {o.itemsCount} item{o.itemsCount === 1 ? "" : "s"}</span>
                  <span className="text-[15px] font-bold text-[#141414]">₹{o.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          />
        </AdminErrorBoundary>

        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          total={data?.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </AdminCard>

      {openOrderId && <OrderDetailModal orderId={openOrderId} onClose={() => setOpenOrderId(null)} />}
    </AdminPageShell>
  );
}
