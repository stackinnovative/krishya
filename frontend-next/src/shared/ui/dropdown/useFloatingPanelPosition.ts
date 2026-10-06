"use client";

import { useEffect, useState, type RefObject } from "react";

export interface FloatingPanelRect {
  top: number;
  left: number;
  width: number;
  openUp: boolean;
  maxHeight: number;
}

export interface UseFloatingPanelPositionOptions {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  /** Assumed panel height when there's ample room in either direction. */
  estimatedHeight?: number;
  /** Floor for the panel's height once it has to shrink to fit. */
  minHeight?: number;
  /** Clearance kept between the panel and the viewport edge. */
  viewportMargin?: number;
  /** Panel width, when it's wider than the trigger itself (e.g. a compact pill trigger opening a wider menu). Defaults to the trigger's own width, in which case it can never overflow since the trigger itself already fits. */
  panelWidth?: number;
}

/**
 * Viewport-aware position + size for a floating panel anchored to a trigger
 * element (a select's popup, a popover, ...). Always prefers opening
 * downward and shrinking to fit the space that's actually there; only flips
 * the panel above the trigger when there's truly more room above than below
 * - otherwise a trigger near the bottom of a short viewport/modal would
 * flip the panel up and cover the fields above it instead of just being
 * smaller.
 */
export function useFloatingPanelPosition({
  open,
  triggerRef,
  estimatedHeight = 270,
  minHeight = 160,
  viewportMargin = 12,
  panelWidth,
}: UseFloatingPanelPositionOptions): FloatingPanelRect | null {
  const [rect, setRect] = useState<FloatingPanelRect | null>(null);

  useEffect(() => {
    if (!open) return;

    const measure = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = panelWidth ?? r.width;
      const spaceBelow = window.innerHeight - r.bottom - viewportMargin;
      const spaceAbove = r.top - viewportMargin;
      const openUp = spaceBelow < minHeight && spaceAbove > spaceBelow;
      const available = openUp ? spaceAbove : spaceBelow;
      // Clamp horizontally so a panel wider than its trigger (or a trigger
      // sitting near the screen edge, as in a right-aligned mobile card)
      // never renders partly off-screen - same margin used vertically.
      const left = Math.min(Math.max(r.left, viewportMargin), window.innerWidth - width - viewportMargin);
      setRect({
        top: openUp ? r.top : r.bottom,
        left,
        width,
        openUp,
        maxHeight: Math.max(minHeight, Math.min(estimatedHeight, available)),
      });
    };

    measure();
    const onScrollOrResize = () => measure();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return rect;
}
