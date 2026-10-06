"use client";

import { useState } from "react";
import { whitePillButton } from "../style-helpers";
import AdminButton from "./AdminButton";
import { ModalPortal } from "@/shared/ui/modal/ModalPortal";
import { useModalShell } from "@/shared/ui/modal/useModalShell";

/**
 * Generic yes/no confirmation dialog for admin actions (status toggles,
 * deletes, etc). Renders the same modal shell as FormModal so it matches
 * the rest of the admin UI instead of the native window.confirm() popup.
 * Stays dumb/controlled - callers own the "is it open" state and decide
 * what happens on confirm.
 */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  const { onBackdropClick, onPanelClick } = useModalShell({ onRequestClose: onClose, busy: confirming });

  return (
    <ModalPortal>
      <div
        onClick={onBackdropClick}
        className="fixed inset-0 z-[200] flex items-center justify-center p-3"
        style={{ background: "rgba(20,20,20,.45)", backdropFilter: "blur(2px)" }}
      >
        <div onClick={onPanelClick} className="animate-fade-up box-border w-full" style={{ background: "#fff", borderRadius: 22, maxWidth: 380 }}>
          <div className="px-6 pb-1 pt-6">
            <div className="text-[17px] font-bold tracking-[-.01em]">{title}</div>
            <p className="mt-2 text-[13px] leading-relaxed text-[#666]">{message}</p>
          </div>

          <div className="flex justify-end gap-2 px-6 pb-6 pt-5">
            <button
              style={{ ...whitePillButton, opacity: confirming ? 0.6 : 1, cursor: confirming ? "not-allowed" : "pointer" }}
              onClick={onClose}
              disabled={confirming}
            >
              {cancelLabel}
            </button>
            <AdminButton
              variant={tone === "danger" ? "danger" : "primary"}
              loading={confirming}
              loadingText="Please wait…"
              onClick={handleConfirm}
            >
              {confirmLabel}
            </AdminButton>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
