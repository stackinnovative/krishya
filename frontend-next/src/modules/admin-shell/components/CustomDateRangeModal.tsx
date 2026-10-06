"use client";

import { useState } from "react";
import { whitePillButton } from "../style-helpers";
import AdminButton from "./AdminButton";
import DateRangeFilter from "./DateRangeFilter";
import { ModalPortal } from "@/shared/ui/modal/ModalPortal";
import { useModalShell } from "@/shared/ui/modal/useModalShell";

/**
 * Date-range picker as a modal rather than an inline row, for a "Custom"
 * filter pill - keeps the from/to inputs from permanently occupying page
 * space (and wrapping awkwardly on mobile) when a preset is selected. Local
 * draft state until "Apply" commits it, so a half-picked range (only "from"
 * chosen so far) never fires a query.
 */
export default function CustomDateRangeModal({
  from,
  to,
  onApply,
  onClose,
}: {
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
  onClose: () => void;
}) {
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  const { onBackdropClick, onPanelClick } = useModalShell({ onRequestClose: onClose });

  const canApply = !!draftFrom && !!draftTo;

  return (
    <ModalPortal>
      <div
        onClick={onBackdropClick}
        className="fixed inset-0 z-[200] flex items-center justify-center p-3"
        style={{ background: "rgba(20,20,20,.45)", backdropFilter: "blur(2px)" }}
      >
        <div onClick={onPanelClick} className="animate-fade-up box-border w-full" style={{ background: "#fff", borderRadius: 22, maxWidth: 380 }}>
          <div className="px-6 pb-1 pt-6">
            <div className="text-[17px] font-bold tracking-[-.01em]">Custom date range</div>
            <p className="mt-2 text-[13px] leading-relaxed text-[#666]">Pick a start and end date.</p>
          </div>

          <div className="px-6 pt-4">
            <DateRangeFilter from={draftFrom} to={draftTo} onChange={(f, t) => { setDraftFrom(f); setDraftTo(t); }} />
          </div>

          <div className="flex justify-end gap-2 px-6 pb-6 pt-5">
            <button style={whitePillButton} onClick={onClose}>
              Cancel
            </button>
            <AdminButton disabled={!canApply} onClick={() => onApply(draftFrom, draftTo)}>
              Apply
            </AdminButton>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
