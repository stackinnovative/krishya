"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Overlay = "menu" | "search" | null;

type StorefrontUI = {
  overlay: Overlay;
  openMenu: () => void;
  openSearch: () => void;
  close: () => void;
};

const StorefrontUIContext = createContext<StorefrontUI | null>(null);

/** Which full-screen overlay (mobile menu drawer / search) is open. Shared so the header, tab bar and drawer can all open/close them. */
export default function StorefrontUIProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const pathname = usePathname();

  const close = useCallback(() => setOverlay(null), []);
  const openMenu = useCallback(() => setOverlay("menu"), []);
  const openSearch = useCallback(() => setOverlay("search"), []);

  // Any navigation (a drawer link, a search result) closes the overlay.
  useEffect(() => {
    setOverlay(null);
  }, [pathname]);

  // Lock page scroll and allow Escape to close while an overlay is open.
  useEffect(() => {
    if (!overlay) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlay(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [overlay]);

  const value = useMemo(() => ({ overlay, openMenu, openSearch, close }), [overlay, openMenu, openSearch, close]);

  return <StorefrontUIContext.Provider value={value}>{children}</StorefrontUIContext.Provider>;
}

export function useStorefrontUI(): StorefrontUI {
  const ctx = useContext(StorefrontUIContext);
  if (!ctx) throw new Error("useStorefrontUI must be used inside StorefrontUIProvider");
  return ctx;
}
