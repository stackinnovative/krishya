"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/format";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { softPillButton } from "@/modules/admin-shell/style-helpers";
import { ModalPortal } from "@/shared/ui/modal/ModalPortal";
import { useModalShell } from "@/shared/ui/modal/useModalShell";
import { adminDownloadInvoiceApi } from "../api/order.api";
import { useAdminOrderDetails } from "../hooks/useAdminOrders";
import OrderStatusDropdown from "./OrderStatusDropdown";

export default function OrderDetailModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { data, isLoading } = useAdminOrderDetails(orderId);
  const [downloading, setDownloading] = useState(false);
  const { onBackdropClick, onPanelClick } = useModalShell({ onRequestClose: onClose, busy: downloading });

  const o = data?.data;

  const handleDownloadInvoice = async () => {
    if (!o) return;
    setDownloading(true);
    try {
      const blob = await adminDownloadInvoiceApi(orderId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${o.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download invoice. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ModalPortal>
    <div onClick={onBackdropClick} className="fixed inset-0 z-[100] flex items-center justify-center p-3" style={{ background: "rgba(20,20,20,.45)", backdropFilter: "blur(2px)" }}>
      <div
        onClick={onPanelClick}
        className="animate-fade-up flex w-full max-h-[90vh] flex-col box-border"
        style={{ background: "#fff", borderRadius: 22, maxWidth: 560 }}
      >
        {isLoading || !o ? (
          <div className="py-10 text-center text-sm text-[#8a8a8e]">Loading…</div>
        ) : (
          <>
            {/* Fixed header */}
            <div className="flex-none px-6 pb-4 pt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[20px] font-bold tracking-[-.01em]">Order {o.orderNumber}</div>
                  <div className="mt-[3px] text-[12.5px] text-[#8a8a8e]">
                    {formatDate(o.timeline.createdAt)} · {o.payment?.method ?? "Payment pending"}
                  </div>
                </div>
                <button onClick={onClose} className="flex h-8 w-8 flex-none items-center justify-center rounded-full" style={{ background: "#f3f3f1" }}>
                  <X size={14} strokeWidth={2.2} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap justify-between gap-3 rounded-[14px] bg-[#f7f7f5] px-4 py-3.5">
                <div>
                  <div className="text-[11px] text-[#8a8a8e]">Customer</div>
                  <div className="text-[13px] font-semibold">{o.user.name}</div>
                  <div className="text-xs text-[#555]">
                    {o.user.addressLine1}
                    {o.user.addressLine2 ? `, ${o.user.addressLine2}` : ""}, {o.user.city}, {o.user.state} {o.user.pincode}
                  </div>
                  <div className="mt-1 text-xs text-[#555]">{o.user.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[#8a8a8e]">Total</div>
                  <div className="text-[20px] font-bold">₹{o.pricing.totalAmount.toLocaleString("en-IN")}</div>
                </div>
              </div>
            </div>

            {/* Scrollable items list */}
            <div className="admin-modal-scroll min-h-0 flex-1 overflow-y-auto px-6">
              <div className="mb-2 text-[13px] font-bold">Items</div>
              <div className="flex flex-col gap-1.5 pb-1">
                {o.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-[#f3f3f1] py-2 text-[12.5px]">
                    <div className="relative h-[34px] w-[34px] flex-none overflow-hidden rounded-full bg-[#f1f1ef]">
                      {it.image && (
                        <Image src={getOptimizedImageUrl(it.image, 68)} alt={it.name} fill sizes="34px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {it.name} {it.colorName ? `· ${it.colorName}` : ""} · Size {it.size}
                      </div>
                      <div className="text-[11.5px] text-[#8a8a8e]">Qty {it.quantity}</div>
                    </div>
                    <div className="font-semibold">₹{(it.price * it.quantity).toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>

              {o.orderStatus === "cancelled" && o.cancelReason && (
                <div className="mt-3 rounded-[12px] bg-[#fde8e4] px-3.5 py-2.5 text-[12.5px] text-[#d6432f]">Cancelled: {o.cancelReason}</div>
              )}
            </div>

            {/* Fixed footer */}
            <div className="flex-none px-6 pb-6 pt-4">
              <div className="mb-2 text-[13px] font-bold">Update status</div>
              <OrderStatusDropdown orderId={orderId} status={o.orderStatus} />

              <div className="mt-5 flex justify-end gap-2">
                <button
                  style={{ ...softPillButton, padding: "11px 22px" }}
                  onClick={handleDownloadInvoice}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Download size={14} strokeWidth={2.2} />
                  {downloading ? "Preparing…" : "Invoice"}
                </button>
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
  );
}
