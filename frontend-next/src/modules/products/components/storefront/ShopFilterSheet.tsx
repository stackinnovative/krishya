"use client";

import { useEffect } from "react";
import type { IdName } from "@/shared/types/api.types";
import { CheckIcon, CloseIcon } from "@/modules/storefront-shell/components/icons";
import { SORT_OPTIONS, type SortValue } from "./SortSelect";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: IdName[];
  categoryId?: string;
  sort: SortValue;
  onCategory: (id: string | undefined) => void;
  onSort: (sort: SortValue) => void;
  onClear: () => void;
  resultLabel: string;
};

function OptionRow({ label, checked, onClick, round = false }: { label: string; checked: boolean; onClick: () => void; round?: boolean }) {
  return (
    <button type="button" role={round ? "radio" : "checkbox"} aria-checked={checked} onClick={onClick} className="flex min-h-11 items-center gap-3 text-left text-[15px] text-ka-ink">
      <span
        className={`grid h-5 w-5 flex-none place-items-center border-[1.5px] ${round ? "rounded-full" : "rounded"} ${checked ? "border-ka-green bg-ka-green text-ka-cream" : "border-ka-sage bg-white text-transparent"}`}
      >
        <CheckIcon size={12} strokeWidth={3} />
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

/** Shop filters: a bottom sheet on phones, a right-hand panel on desktop (design's sheetUI). Changes apply immediately; the footer button just closes it. */
export default function ShopFilterSheet({ open, onClose, categories, categoryId, sort, onCategory, onSort, onClear, resultLabel }: Props) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end ka:items-end" role="dialog" aria-modal="true" aria-label="Filters">
      <div onClick={onClose} className="animate-ka-fade absolute inset-0 bg-[rgba(20,35,27,.45)]" />
      <div className="animate-ka-sheet relative flex max-h-[86dvh] w-full flex-col rounded-t-[20px] bg-ka-cream ka:h-full ka:max-h-full ka:w-[400px] ka:rounded-none">
        <div className="flex justify-center pt-2.5 ka:hidden">
          <span className="h-1 w-10 rounded-sm bg-ka-line" />
        </div>
        <div className="flex items-center justify-between border-b border-ka-gold/45 px-5 pb-3.5 pt-2.5 ka:pt-5">
          <span className="font-display text-[26px] font-semibold text-ka-green">Filters</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClear} className="py-2 text-sm font-semibold text-ka-green">
              Clear all
            </button>
            <button type="button" onClick={onClose} aria-label="Close filters" className="hidden h-10 w-10 place-items-center rounded-full bg-ka-mint text-ka-green ka:grid">
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-[26px] overflow-auto p-5">
          {categories.length > 0 && (
            <div role="radiogroup" aria-label="Health need" className="flex flex-col gap-1.5">
              <span className="mb-1.5 text-xs font-bold tracking-[.16em] text-ka-green">HEALTH NEED</span>
              <OptionRow round label="All products" checked={!categoryId} onClick={() => onCategory(undefined)} />
              {categories.map((c) => (
                <OptionRow key={c.id} round label={c.name} checked={categoryId === c.id} onClick={() => onCategory(c.id)} />
              ))}
            </div>
          )}
          <div role="radiogroup" aria-label="Sort by" className="flex flex-col gap-1.5">
            <span className="mb-1.5 text-xs font-bold tracking-[.16em] text-ka-green">SORT BY</span>
            {SORT_OPTIONS.map((o) => (
              <OptionRow key={o.value} round label={o.label} checked={sort === o.value} onClick={() => onSort(o.value)} />
            ))}
          </div>
        </div>

        <div className="border-t border-ka-gold/45 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3.5">
          <button type="button" onClick={onClose} className="h-[52px] w-full rounded-lg bg-ka-green text-[15px] font-semibold text-ka-cream">
            {resultLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
