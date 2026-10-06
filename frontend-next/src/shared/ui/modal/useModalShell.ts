"use client";

import { useEffect } from "react";

export interface UseModalShellOptions {
  onRequestClose: () => void;
  /** True while an async action (save/confirm/crop) this modal triggers is in flight - guards Escape and backdrop-click so an in-progress action can't be dismissed out from under itself. */
  busy?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  lockBodyScroll?: boolean;
}

export interface ModalShellHandlers {
  onBackdropClick: (e: React.MouseEvent) => void;
  onPanelClick: (e: React.MouseEvent) => void;
}

/**
 * Shell behavior shared by every admin modal (backdrop click-to-close,
 * Escape-to-close, body-scroll lock) so a fix or addition here reaches
 * every modal at once instead of being re-implemented, and inevitably
 * drifting, per component. Callers still own their own visual chrome and
 * any domain logic (validation, uploads, ...) - this hook only owns the
 * "is it dismissible right now" behavior.
 *
 * These modals are conditionally *mounted* by their callers rather than
 * taking an `isOpen` prop, so this hook runs for the component's whole
 * mounted lifetime rather than modeling its own open/closed state.
 */
export function useModalShell({
  onRequestClose,
  busy = false,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  lockBodyScroll = true,
}: UseModalShellOptions): ModalShellHandlers {
  useEffect(() => {
    if (!closeOnEscape) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onRequestClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeOnEscape, busy, onRequestClose]);

  useEffect(() => {
    if (!lockBodyScroll) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    // Hiding the scrollbar shrinks the viewport's content width, so
    // everything reflows a scrollbar's-width to the right - the whole page
    // visibly "jumps" open and jumps back on close. Measuring the actual
    // scrollbar width (0 on mobile/overlay-scrollbar systems) and adding it
    // as padding keeps the content width constant instead. Reads the
    // padding that's already there (relevant when a second modal opens on
    // top of a first, which already added its own) rather than overwriting it.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const currentPaddingRight = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [lockBodyScroll]);

  return {
    onBackdropClick: () => {
      if (closeOnBackdropClick && !busy) onRequestClose();
    },
    onPanelClick: (e) => {
      e.stopPropagation();
    },
  };
}
