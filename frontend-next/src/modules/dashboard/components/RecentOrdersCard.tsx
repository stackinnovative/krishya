"use client";

import { useState } from "react";
import Link from "next/link";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminErrorBoundary from "@/modules/admin-shell/components/AdminErrorBoundary";
import AdminTable, { type AdminTableColumn } from "@/modules/admin-shell/components/AdminTable";
import { useAdminOrders } from "@/modules/orders/hooks/useAdminOrders";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/modules/orders/utils/order-status";
import type { AdminOrderListItem } from "@/modules/orders/types/order.type";
import OrderDetailModal from "@/modules/orders/components/OrderDetailModal";

const columns: AdminTableColumn<AdminOrderListItem>[] = [
  { key: "order", header: "Order", render: (o) => <span className="text-[12.5px] font-semibold">{o.orderNumber}</span> },
  { key: "customer", header: "Customer", render: (o) => <span className="text-[12.5px]">{o.customerName}</span> },
  { key: "total", header: "Total", render: (o) => <span className="text-[12.5px] font-semibold">₹{o.totalAmount.toLocaleString("en-IN")}</span> },
  {
    key: "status",
    header: "Status",
    render: (o) => {
      const badge = ORDER_STATUS_BADGE[o.orderStatus];
      return (
        <span className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: badge.bg, color: badge.fg }}>
          {ORDER_STATUS_LABEL[o.orderStatus]}
        </span>
      );
    },
  },
];

export default function RecentOrdersCard() {
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useAdminOrders({ limit: 5, sort: "-createdAt" });

  return (
    <AdminCard padding="20px" className="min-w-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[13px] font-semibold">Recent Orders</div>
        <Link href="/admin/orders" className="text-xs font-semibold text-[#8a8a8e] hover:text-[#141414]">
          See all →
        </Link>
      </div>
      <AdminErrorBoundary compact>
        <AdminTable
          columns={columns}
          rows={data?.data ?? []}
          getRowKey={(o) => o.id}
          minWidth={460}
          dense
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          errorMessage="Recent orders couldn't load."
          emptyMessage="No orders yet."
          onRowClick={(o) => setOpenOrderId(o.id)}
        />
      </AdminErrorBoundary>
      {openOrderId && <OrderDetailModal orderId={openOrderId} onClose={() => setOpenOrderId(null)} />}
    </AdminCard>
  );
}
