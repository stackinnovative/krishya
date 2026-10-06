"use client";

import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminAsyncState from "@/modules/admin-shell/components/AdminAsyncState";
import Skeleton from "@/modules/admin-shell/components/Skeleton";
import { useOrderStatusDistribution } from "@/modules/dashboard/hooks/useDashboard";
import { ORDER_STATUS_DONUT_COLOR, ORDER_STATUS_LABEL } from "@/modules/orders/utils/order-status";

function DonutSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <Skeleton className="h-[160px] w-[160px] rounded-full" />
      <div className="flex w-full flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function OrderStatusDonutCard() {
  const { data, isLoading, isError, refetch } = useOrderStatusDistribution();

  const totalOrders = data?.data?.totalOrders ?? 0;
  const C = 2 * Math.PI * 50;
  let acc = 0;
  const donutSegments = (data?.data?.statuses ?? []).map((s) => {
    const len = totalOrders ? (s.count / totalOrders) * C : 0;
    const seg = { ...s, color: ORDER_STATUS_DONUT_COLOR[s.status], dash: `${len} ${C - len}`, offset: -acc };
    acc += len;
    return seg;
  });

  return (
    <AdminCard padding="20px">
      <div className="mb-2.5 text-[13px] font-semibold">Order Status</div>
      <AdminAsyncState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        skeleton={<DonutSkeleton />}
        errorTitle="Order status unavailable"
        compact
      >
        <>
          <div className="relative flex items-center justify-center py-2">
            <svg width="160" height="160" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f1ef" strokeWidth="12" />
              {donutSegments.map((d) => (
                <circle key={d.status} cx="60" cy="60" r="50" fill="none" strokeWidth="12" stroke={d.color} style={{ strokeDasharray: d.dash, strokeDashoffset: d.offset }} />
              ))}
            </svg>
            <div className="absolute text-center">
              <div className="text-[26px] font-bold tracking-[-.02em]">{totalOrders}</div>
              <div className="text-[11px] text-[#8a8a8e]">Total Orders</div>
            </div>
          </div>
          {donutSegments.length > 0 ? (
            <div className="mt-2 flex flex-col gap-2">
              {donutSegments.map((d) => (
                <div key={d.status} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1 text-[#555]">{ORDER_STATUS_LABEL[d.status]}</span>
                  <span className="font-semibold">{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 py-2 text-center text-xs text-[#8a8a8e]">No orders yet.</div>
          )}
        </>
      </AdminAsyncState>
    </AdminCard>
  );
}
