"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { useDropdownState } from "@/shared/ui/dropdown/useDropdownState";
import { useFloatingPanelPosition } from "@/shared/ui/dropdown/useFloatingPanelPosition";
import ConfirmModal from "@/modules/admin-shell/components/ConfirmModal";
import { useAcceptOrder, useCancelOrder, useDeliverOrder, useDispatchOrder } from "../hooks/useAdminOrders";
import { ORDER_STATUS_ACTION_LABEL, ORDER_STATUS_BADGE, ORDER_STATUS_LABEL, ORDER_STATUS_TRANSITIONS } from "../utils/order-status";
import type { OrderStatus } from "../types/order.type";

/**
 * Compact colour-coded status pill that doubles as the admin's only way to
 * change an order's status - drop it into a table row or a detail modal,
 * it owns its own mutations and only ever offers the transitions the
 * backend actually allows from the order's current status (see
 * ORDER_STATUS_TRANSITIONS, mirrored 1:1 from the backend's per-endpoint
 * guards). Built on the same headless dropdown hooks SearchableSelect
 * uses, just with a small pill trigger instead of a form-field look.
 */
/** Fixed so every status label ("New" through "Dispatched") renders at the
 * same width - same fix as StatusBadge's FIXED_WIDTH, otherwise switching
 * status shifts this column (and everything after it) and reads as the
 * table jittering. Wide enough for "Dispatched" + the chevron icon. */
const FIXED_WIDTH = 118;

export default function OrderStatusDropdown({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const { mutate: accept, isPending: accepting } = useAcceptOrder();
  const { mutate: dispatch, isPending: dispatching } = useDispatchOrder();
  const { mutate: deliver, isPending: delivering } = useDeliverOrder();
  const { mutateAsync: cancel } = useCancelOrder();
  const [cancelling, setCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const busy = accepting || dispatching || delivering || cancelling;

  const nextStatuses = ORDER_STATUS_TRANSITIONS[status];
  const options = nextStatuses.map((s) => ({ value: s, label: ORDER_STATUS_ACTION_LABEL[s] ?? `Mark ${ORDER_STATUS_LABEL[s]}` }));

  const handleChoose = (target: string) => {
    // Cancelling is the one destructive, hard-to-reverse transition here - the
    // rest (accept/dispatch/deliver) just move the order forward.
    if (target === "cancelled") setConfirmingCancel(true);
    else if (target === "accepted") accept(orderId);
    else if (target === "dispatched") dispatch(orderId);
    else if (target === "delivered") deliver(orderId);
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await cancel(orderId);
    } finally {
      setCancelling(false);
    }
  };

  const { open, toggleMenu, filteredOptions, highlighted, setHighlighted, triggerRef, panelRef, choose, handleKeyDown } = useDropdownState({
    options,
    value: status,
    onChange: handleChoose,
  });

  const rect = useFloatingPanelPosition({ open, triggerRef, estimatedHeight: 100, minHeight: 60, panelWidth: 160 });
  const badge = ORDER_STATUS_BADGE[status];

  // Terminal statuses (delivered/cancelled) have nothing to transition to - same plain badge as before, not clickable.
  if (options.length === 0) {
    return (
      <span
        className="inline-flex flex-none items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
        style={{ background: badge.bg, color: badge.fg, width: FIXED_WIDTH, boxSizing: "border-box" }}
      >
        {ORDER_STATUS_LABEL[status]}
      </span>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          if (!busy) toggleMenu();
        }}
        onKeyDown={handleKeyDown}
        className="inline-flex flex-none items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
        style={{
          background: badge.bg,
          color: badge.fg,
          border: "none",
          width: FIXED_WIDTH,
          boxSizing: "border-box",
          opacity: busy ? 0.6 : 1,
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {ORDER_STATUS_LABEL[status]}
        <ChevronDown size={12} className="flex-none" />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[300] flex flex-col overflow-hidden"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              // CSS-level backstop on top of the JS-computed left/width above -
              // guarantees the panel can never render wider than the viewport
              // even if a stale measurement briefly lags an orientation/resize change.
              maxWidth: "calc(100vw - 24px)",
              maxHeight: rect.maxHeight,
              transform: rect.openUp ? "translateY(-100%)" : undefined,
              marginTop: rect.openUp ? -6 : 6,
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #ececea",
              boxShadow: "0 10px 30px rgba(20,20,20,.16)",
            }}
          >
            <div className="flex-1 overflow-y-auto py-1">
              {filteredOptions.map((opt, i) => (
                <div
                  key={opt.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => choose(opt)}
                  className="cursor-pointer truncate px-3.5 py-2.5 text-[13px] font-medium"
                  style={{
                    background: i === highlighted ? "#141414" : "transparent",
                    color: i === highlighted ? "#fff" : opt.value === "cancelled" ? "#d6432f" : "#141414",
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}

      {confirmingCancel && (
        <ConfirmModal
          title="Cancel this order?"
          message="The customer will be notified and this can't be undone."
          confirmLabel="Cancel order"
          tone="danger"
          onConfirm={handleConfirmCancel}
          onClose={() => setConfirmingCancel(false)}
        />
      )}
    </>
  );
}
