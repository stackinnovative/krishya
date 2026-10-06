"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const VIEWPORT_MARGIN = 8;
const GAP = 8;

type Rect = { top: number; left: number; placement: "top" | "bottom"; arrowLeft: number };

/**
 * Reusable tooltip: portal-rendered, dark admin-themed bubble that always
 * shows the trigger's full text, positioned to stay on-screen and flip side
 * when it would overflow the viewport. Works on hover + keyboard focus
 * (desktop) and tap-to-toggle (touch, where hover never fires) - dismissed
 * by tapping elsewhere, blurring, or Escape.
 *
 * Pass `whenTruncated` for text that's clipped by a fixed-width container
 * (e.g. a table cell) - the tooltip then only opens when the trigger is
 * actually overflowing its box, instead of showing for text that already
 * fits. Without it, the tooltip always shows on hover/focus - a drop-in
 * replacement for a plain `title=""` on things like icon buttons.
 */
export default function Tooltip({
  content,
  children,
  whenTruncated = false,
  side = "top",
}: {
  content: ReactNode;
  children: ReactElement;
  whenTruncated?: boolean;
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const isOverflowing = () => {
    const el = triggerRef.current;
    if (!el) return false;
    return el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
  };

  const show = () => {
    if (whenTruncated && !isOverflowing()) return;
    setOpen(true);
  };
  const hide = () => setOpen(false);

  const handleClick = () => {
    const isTouch = typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches;
    if (!isTouch) return;
    setOpen((wasOpen) => {
      if (wasOpen) return false;
      return !whenTruncated || isOverflowing();
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }
    const measure = () => {
      const trigger = triggerRef.current;
      const bubble = bubbleRef.current;
      if (!trigger || !bubble) return;
      const t = trigger.getBoundingClientRect();
      const bw = bubble.offsetWidth;
      const bh = bubble.offsetHeight;
      const spaceAbove = t.top - VIEWPORT_MARGIN;
      const spaceBelow = window.innerHeight - t.bottom - VIEWPORT_MARGIN;
      const placement: "top" | "bottom" =
        side === "top"
          ? spaceAbove >= bh + GAP || spaceAbove >= spaceBelow
            ? "top"
            : "bottom"
          : spaceBelow >= bh + GAP || spaceBelow >= spaceAbove
            ? "bottom"
            : "top";
      const idealLeft = t.left + t.width / 2 - bw / 2;
      const left = Math.min(Math.max(idealLeft, VIEWPORT_MARGIN), window.innerWidth - bw - VIEWPORT_MARGIN);
      const top = placement === "top" ? t.top - GAP - bh : t.bottom + GAP;
      const arrowLeft = Math.min(Math.max(t.left + t.width / 2 - left, 12), bw - 12);
      setRect({ top, left, placement, arrowLeft });
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, side]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (bubbleRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!isValidElement(children)) return children;

  const childProps = children.props as Record<string, unknown>;
  const childRef = (children as unknown as { ref?: unknown }).ref;

  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (typeof childRef === "function") childRef(node);
      else if (childRef && typeof childRef === "object") (childRef as { current: unknown }).current = node;
    },
    onMouseEnter: (e: ReactMouseEvent) => {
      (childProps.onMouseEnter as ((e: ReactMouseEvent) => void) | undefined)?.(e);
      show();
    },
    onMouseLeave: (e: ReactMouseEvent) => {
      (childProps.onMouseLeave as ((e: ReactMouseEvent) => void) | undefined)?.(e);
      hide();
    },
    onFocus: (e: FocusEvent) => {
      (childProps.onFocus as ((e: FocusEvent) => void) | undefined)?.(e);
      show();
    },
    onBlur: (e: FocusEvent) => {
      (childProps.onBlur as ((e: FocusEvent) => void) | undefined)?.(e);
      hide();
    },
    onClick: (e: ReactMouseEvent) => {
      (childProps.onClick as ((e: ReactMouseEvent) => void) | undefined)?.(e);
      handleClick();
    },
    onKeyDown: (e: ReactKeyboardEvent) => {
      (childProps.onKeyDown as ((e: ReactKeyboardEvent) => void) | undefined)?.(e);
      if (e.key === "Escape") hide();
    },
    tabIndex: (childProps.tabIndex as number | undefined) ?? 0,
  });

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <div
            ref={bubbleRef}
            role="tooltip"
            className="pointer-events-none fixed z-[500] max-w-[280px] rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium leading-snug transition-opacity duration-150"
            style={{
              top: rect?.top ?? -9999,
              left: rect?.left ?? -9999,
              background: "#141414",
              color: "#fff",
              opacity: rect ? 1 : 0,
              boxShadow: "0 10px 24px rgba(20,20,20,.22)",
              wordBreak: "break-word",
            }}
          >
            {content}
            {rect && (
              <span
                aria-hidden
                className="absolute h-2 w-2 rotate-45"
                style={{
                  left: rect.arrowLeft - 4,
                  background: "#141414",
                  ...(rect.placement === "top" ? { bottom: -4 } : { top: -4 }),
                }}
              />
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
