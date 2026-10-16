"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { blackPillButton, whitePillButton } from "@/modules/admin-shell/style-helpers";
import { formatCurrency } from "@/lib/format";
import { useAdminProductDetails } from "../hooks/useAdminProducts";
import { PRODUCT_TYPE_LABELS, formatVariantLabel } from "../constants/product-options";
import { ModalPortal } from "@/shared/ui/modal/ModalPortal";
import { useModalShell } from "@/shared/ui/modal/useModalShell";

export default function ProductViewModal({
  productId,
  onClose,
  onEdit,
}: {
  productId: string;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { data, isLoading } = useAdminProductDetails(productId);
  const p = data?.data;
  const { onBackdropClick, onPanelClick } = useModalShell({ onRequestClose: onClose });

  return (
    <ModalPortal>
      <div onClick={onBackdropClick} className="fixed inset-0 z-[200] flex items-center justify-center p-3" style={{ background: "rgba(20,20,20,.45)", backdropFilter: "blur(2px)" }}>
      <div
        onClick={onPanelClick}
        className="animate-fade-up w-full max-h-[90vh] overflow-auto box-border"
        style={{ background: "#fff", borderRadius: 22, maxWidth: 600, padding: 24 }}
      >
        {isLoading || !p ? (
          <div className="py-10 text-center text-sm text-[#8a8a8e]">Loading…</div>
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[20px] font-bold tracking-[-.01em]">{p.name}</div>
                <div className="mt-[3px] text-[12.5px] text-[#8a8a8e]">
                  {p.category.name} · {PRODUCT_TYPE_LABELS[p.type]} · {p.isFeatured ? "Featured" : "Standard"}
                  {p.badge && <> · {p.badge}</>}
                </div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 flex-none items-center justify-center rounded-full" style={{ background: "#f3f3f1" }}>
                <X size={14} strokeWidth={2.2} />
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="relative h-40 w-40 flex-none overflow-hidden rounded-2xl bg-[#f1f1ef]">
                {p.images[0]?.url && (
                  <Image src={getOptimizedImageUrl(p.images[0].url, 320)} alt={p.name} fill sizes="160px" className="object-cover" />
                )}
              </div>
              <div className="min-w-[200px] flex-1 text-[13px] leading-[1.6] text-[#444]">
                <div className="font-semibold text-[#141414]">{p.shortDescription}</div>
                <div className="mt-1">{p.description}</div>
              </div>
            </div>

            <div className="mt-[18px] grid grid-cols-3 gap-2.5">
              <div className="rounded-[14px] bg-[#f7f7f5] px-3.5 py-3">
                <div className="text-[11px] text-[#8a8a8e]">Photos</div>
                <div className="text-[18px] font-bold">{p.images.length}</div>
              </div>
              <div className="rounded-[14px] bg-[#f7f7f5] px-3.5 py-3">
                <div className="text-[11px] text-[#8a8a8e]">Quantities</div>
                <div className="text-[18px] font-bold">{p.variants.length}</div>
              </div>
              <div className="rounded-[14px] bg-[#f7f7f5] px-3.5 py-3">
                <div className="text-[11px] text-[#8a8a8e]">Stock</div>
                <div className="text-[18px] font-bold">{p.variants.reduce((s, v) => s + v.stock, 0)}</div>
              </div>
            </div>

            <div className="mb-2 mt-5 text-[13px] font-bold">Quantities</div>
            <div className="flex flex-col rounded-[14px] bg-[#fafaf8] px-3.5 py-1.5">
              {p.variants.map((v) => (
                <div key={v.variantId} className="flex flex-wrap items-center gap-3 border-t border-[#eeeeec] py-1.5 text-[12.5px] first:border-t-0">
                  <span className="min-w-[70px] font-semibold">{formatVariantLabel(v)}</span>
                  <span className="font-semibold">{formatCurrency(v.price)}</span>
                  {v.discountPercent > 0 && (
                    <span className="text-[#8a8a8e]">
                      <s>{formatCurrency(v.mrp)}</s> <span style={{ color: "#2e9e4b" }}>{v.discountPercent}% off</span>
                    </span>
                  )}
                  <span className="flex-1 text-[#8a8a8e]">
                    Stock {v.stock}
                    {!v.isActive && " · off sale"}
                  </span>
                  {v.isDefault && (
                    <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: "#eef6ec", color: "#2e9e4b" }}>
                      Default
                    </span>
                  )}
                </div>
              ))}
            </div>

            {(p.ingredients.length > 0 || p.howToUse || p.storage) && (
              <div className="mt-5 flex flex-col gap-2.5 text-[12.5px] leading-[1.55] text-[#444]">
                {p.ingredients.length > 0 && (
                  <div>
                    <div className="mb-1 text-[13px] font-bold text-[#141414]">Key ingredients</div>
                    {p.ingredients.map((i) => (
                      <div key={i.name}>
                        {i.name}
                        {i.botanicalName && <span className="text-[#8a8a8e]"> · {i.botanicalName}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {p.howToUse && (
                  <div>
                    <div className="mb-1 text-[13px] font-bold text-[#141414]">How to use</div>
                    {p.howToUse}
                  </div>
                )}
                {p.storage && (
                  <div>
                    <div className="mb-1 text-[13px] font-bold text-[#141414]">Storage</div>
                    {p.storage}
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button style={whitePillButton} onClick={onEdit}>
                Edit product
              </button>
              <button style={{ ...blackPillButton, padding: "11px 22px" }} onClick={onClose}>
                Done
              </button>
            </div>
          </>
        )}
      </div>
      </div>
    </ModalPortal>
  );
}
