"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SWIPE_PX = 40;

/**
 * Index + controls for the home hero slideshow.
 * - Auto-advances every `intervalMs` while more than one slide exists.
 * - Pauses while the hero is hovered or has keyboard focus, while the tab is
 *   hidden, and entirely for visitors who ask for reduced motion.
 * - Any manual change (dot, swipe) restarts the timer, so a slide the
 *   visitor picked never flips away a moment later.
 */
export function useHeroSlideshow(count: number, intervalMs: number) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const swipeStartX = useRef<number | null>(null);

  // Slides can disappear (admin deactivates one) - never point past the end.
  const active = count > 0 ? index % count : 0;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mq.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const paused = hovered || focused || hidden || reducedMotion;

  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearTimeout(timer);
  }, [active, count, paused, intervalMs, restartKey]);

  const goTo = useCallback(
    (i: number) => {
      if (count < 1) return;
      setIndex(((i % count) + count) % count);
      setRestartKey((k) => k + 1);
    },
    [count],
  );

  /** Spread onto the hero wrapper: hover/focus pause + touch swipe. */
  const bind = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (e: React.FocusEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
    },
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") swipeStartX.current = e.clientX;
    },
    onPointerUp: (e: React.PointerEvent) => {
      const start = swipeStartX.current;
      swipeStartX.current = null;
      if (start === null || count < 2) return;
      const dx = e.clientX - start;
      if (Math.abs(dx) >= SWIPE_PX) goTo(active + (dx < 0 ? 1 : -1));
    },
  };

  return { active, goTo, bind };
}
