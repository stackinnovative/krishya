"use client";

import { createPortal } from "react-dom";

/**
 * Renders children into document.body instead of in-flow. Modals routinely
 * get mounted inside a scrollable page/section - an in-flow modal can end up
 * clipped by an ancestor's `overflow`, or stack incorrectly under something
 * with its own z-index, instead of always floating above everything.
 */
export function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
