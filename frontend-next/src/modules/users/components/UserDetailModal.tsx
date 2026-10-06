"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { formatDate } from "@/lib/format";
import { softPillButton } from "@/modules/admin-shell/style-helpers";
import { ModalPortal } from "@/shared/ui/modal/ModalPortal";
import { useModalShell } from "@/shared/ui/modal/useModalShell";
import FormModal, { type FormFieldDef } from "@/modules/admin-shell/components/FormModal";
import { useAdminOrders } from "@/modules/orders/hooks/useAdminOrders";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/modules/orders/utils/order-status";
import OrderDetailModal from "@/modules/orders/components/OrderDetailModal";
import { useAdminUserDetail, useUpdateAdminUser } from "../hooks/useAdminUsers";
import type { UpdateUserPayload } from "../types/user.type";

const EDIT_USER_FIELDS: FormFieldDef[] = [
  { key: "name", label: "Full name", type: "text", required: true, minLength: 2, maxLength: 100 },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "phone", label: "Phone (optional)", type: "tel" },
  {
    key: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { label: "Customer", value: "user" },
      { label: "Admin", value: "admin" },
    ],
  },
  { key: "password", label: "New password (leave blank to keep current)", type: "password" },
];

export default function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data, isLoading } = useAdminUserDetail(userId);
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders({ userId, limit: 50, sort: "newest" });
  const { mutateAsync: updateUser } = useUpdateAdminUser();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const u = data?.data;
  const orders = ordersData?.data ?? [];
  const { onBackdropClick, onPanelClick } = useModalShell({ onRequestClose: onClose });

  const handleUpdate = async (values: Record<string, unknown>) => {
    const password = values.password ? String(values.password) : undefined;
    await updateUser({
      userId,
      data: {
        name: String(values.name ?? ""),
        email: String(values.email ?? ""),
        phone: values.phone ? String(values.phone) : undefined,
        role: values.role === "admin" ? "admin" : "user",
        ...(password ? { password } : {}),
      } satisfies UpdateUserPayload,
    });
    setEditing(false);
  };

  return (
    <>
    <ModalPortal>
    <div onClick={onBackdropClick} className="fixed inset-0 z-[100] flex items-center justify-center p-3" style={{ background: "rgba(20,20,20,.45)", backdropFilter: "blur(2px)" }}>
      <div
        onClick={onPanelClick}
        className="animate-fade-up flex w-full max-h-[90vh] flex-col box-border"
        style={{ background: "#fff", borderRadius: 22, maxWidth: 560 }}
      >
        {isLoading || !u ? (
          <div className="py-10 text-center text-sm text-[#8a8a8e]">Loading…</div>
        ) : (
          <>
            {/* Fixed header */}
            <div className="flex-none px-6 pb-4 pt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-[20px] font-bold tracking-[-.01em]">{u.name}</div>
                    <span
                      className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{ background: u.role === "admin" ? "#e3edfb" : "#eeeeec", color: u.role === "admin" ? "#2f6fd6" : "#666" }}
                    >
                      {u.role === "admin" ? "Admin" : "Customer"}
                    </span>
                  </div>
                  <div className="mt-[3px] text-[12.5px] text-[#8a8a8e]">Joined {formatDate(u.createdAt)}</div>
                </div>
                <div className="flex flex-none items-center gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full"
                    style={{ background: "#f3f3f1" }}
                    title="Edit user"
                  >
                    <Pencil size={13} strokeWidth={2.2} />
                  </button>
                  <button onClick={onClose} className="flex h-8 w-8 flex-none items-center justify-center rounded-full" style={{ background: "#f3f3f1" }}>
                    <X size={14} strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1 rounded-[14px] bg-[#f7f7f5] px-4 py-3.5 text-[12.5px]">
                <div className="text-[13px] font-semibold">{u.email}</div>
                {u.phone && <div className="text-[#555]">{u.phone}</div>}
                {u.address && (
                  <div className="mt-1 text-[#555]">
                    {u.address.addressLine1}
                    {u.address.addressLine2 ? `, ${u.address.addressLine2}` : ""}, {u.address.city}, {u.address.state} {u.address.pincode}
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable orders list */}
            <div className="admin-modal-scroll min-h-0 flex-1 overflow-y-auto px-6">
              <div className="mb-2 text-[13px] font-bold">Orders ({orders.length})</div>
              <div className="flex flex-col gap-1.5 pb-1">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setOpenOrderId(o.id)}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-[12px] border border-[#f3f3f1] px-3 py-2.5 text-[12.5px] hover:bg-[#fafaf8]"
                  >
                    <div>
                      <div className="font-semibold">{o.orderNumber}</div>
                      <div className="text-[11px] text-[#8a8a8e]">{formatDate(o.createdAt)} · {o.itemsCount} item{o.itemsCount === 1 ? "" : "s"}</div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ background: ORDER_STATUS_BADGE[o.orderStatus].bg, color: ORDER_STATUS_BADGE[o.orderStatus].fg }}
                      >
                        {ORDER_STATUS_LABEL[o.orderStatus]}
                      </span>
                      <span className="font-semibold">₹{o.totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}

                {!ordersLoading && orders.length === 0 && (
                  <div className="py-6 text-center text-[12.5px] text-[#8a8a8e]">No orders yet.</div>
                )}
              </div>
            </div>

            {/* Fixed footer */}
            <div className="flex-none px-6 pb-6 pt-4">
              <div className="flex justify-end gap-2">
                <button style={{ ...softPillButton, padding: "11px 22px" }} onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </ModalPortal>

    {openOrderId && <OrderDetailModal orderId={openOrderId} onClose={() => setOpenOrderId(null)} />}

    {editing && u && (
      <FormModal
        title="Edit user"
        fields={EDIT_USER_FIELDS}
        initialValues={{ name: u.name, email: u.email, phone: u.phone ?? "", role: u.role, password: "" }}
        saveLabel="Save changes"
        onSave={handleUpdate}
        onClose={() => setEditing(false)}
      />
    )}
    </>
  );
}
