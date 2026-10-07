"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { downloadInvoiceApi, getOrderSummaryApi } from "@/modules/orders/api/order.api";
import { SectionDecor } from "@/modules/storefront-shell/components/decor";
import { CheckIcon, WhatsAppIcon } from "@/modules/storefront-shell/components/icons";

const formatEtaDay = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

/** Delivery window shown on the receipt: 4-6 days after the order was placed. */
const estimateDelivery = (createdAt: string) => {
  const from = new Date(createdAt);
  const to = new Date(createdAt);
  from.setDate(from.getDate() + 4);
  to.setDate(to.getDate() + 6);
  return `${formatEtaDay(from)} – ${formatEtaDay(to)}`;
};

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
    <section className="relative isolate mx-auto max-w-[720px] overflow-clip px-4 py-[clamp(48px,6vw,96px)] sm:px-[clamp(20px,4vw,56px)]">
      <SectionDecor variant="c" />
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="grid h-[84px] w-[84px] place-items-center rounded-full border border-ka-sage bg-ka-mint text-ka-green">
          <CheckIcon size={36} strokeWidth={1.8} />
        </span>
        <h1 className="m-0 font-display text-[clamp(38px,4.4vw,56px)] font-medium leading-[1.05] text-ka-green">Thank you for your order</h1>
        <p className="m-0 text-base leading-[1.6] text-ka-body">Your order has been placed and is being prepared with care.</p>
      </div>

      {isLoading ? (
        <div className="mt-9 h-[240px] animate-pulse rounded-xl bg-ka-sand" />
      ) : (
        order && (
          <div className="mt-9 flex flex-col gap-3.5 rounded-xl border border-ka-sand bg-white p-[clamp(20px,3vw,32px)]">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 border-b border-ka-gold/50 pb-[18px]">
              <span className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[.14em] text-ka-muted">Order number</span>
                <span className="text-[17px] font-bold text-ka-green">#{order.orderNumber}</span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[.14em] text-ka-muted">Estimated delivery</span>
                <span className="text-[15px] font-semibold text-ka-green">{estimateDelivery(order.createdAt)}</span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[.14em] text-ka-muted">Updates sent to</span>
                <span className="break-all text-[15px] font-semibold text-ka-green">{order.userSnapshot.email}</span>
              </span>
            </div>
            {order.items.map((l) => (
              <div key={l.itemId} className="flex justify-between gap-3 text-[15px]">
                <span>
                  {l.name}{" "}
                  <span className="text-ka-muted">
                    · {l.size} × {l.quantity}
                  </span>
                </span>
                <span className="font-semibold">{formatCurrency(l.price * l.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-ka-sand pt-3 text-[14.5px] text-ka-body">
              <span>Delivery</span>
              <span>{order.shippingFee ? formatCurrency(order.shippingFee) : "Free"}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-ka-green">Total paid</span>
              <span className="font-display text-[30px] font-bold text-ka-green">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        )
      )}

      <div className="mt-5 flex items-center gap-3.5 rounded-[10px] bg-ka-mint px-[18px] py-4 text-[14.5px] text-ka-green">
        <WhatsAppIcon size={22} className="flex-none text-ka-wa" />
        You will receive order updates on WhatsApp.
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {order && (
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="inline-flex h-[52px] items-center gap-2 whitespace-nowrap rounded-lg border border-ka-gold px-7 text-[15px] font-semibold text-ka-green hover:bg-ka-gold/[.12] disabled:opacity-60"
          >
            <Download size={16} />
            {downloading ? "Preparing invoice…" : "Download invoice"}
          </button>
        )}
        <Link href="/products" className="flex h-[52px] items-center whitespace-nowrap rounded-lg bg-ka-green px-8 text-[15px] font-semibold text-ka-cream">
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
