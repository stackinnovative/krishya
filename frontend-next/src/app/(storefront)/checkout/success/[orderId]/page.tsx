"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CheckCircle2, Download } from "lucide-react";
import { downloadInvoiceApi, getOrderSummaryApi } from "@/modules/orders/api/order.api";

export default function OrderSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent params={params} />
    </Suspense>
  );
}

function OrderSuccessContent({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const searchParams = useSearchParams();
  const guestId = searchParams.get("guestId") ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["order-summary", orderId, guestId],
    queryFn: () => getOrderSummaryApi(orderId, guestId),
    enabled: !!orderId && !!guestId,
  });

  const order = data?.data;
  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const blob = await downloadInvoiceApi(orderId, guestId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.orderNumber}.pdf`;
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
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <CheckCircle2 size={56} className="mx-auto" style={{ color: "var(--accent)" }} />
      <h1 className="mt-4 font-serif text-3xl font-semibold">Order placed!</h1>
      {isLoading ? (
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Loading your order…</p>
      ) : order ? (
        <>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Order {order.orderNumber} · ₹{order.totalAmount.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            We&apos;ll send updates to {order.userSnapshot.email}.
          </p>
        </>
      ) : null}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {order && (
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold disabled:opacity-60"
            style={{ borderColor: "var(--accent)", color: "var(--accent-strong)" }}
          >
            <Download size={16} />
            {downloading ? "Preparing invoice…" : "Download invoice"}
          </button>
        )}
        <Link href="/products" className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: "var(--accent)" }}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
