"use client";

import { useEffect, useState } from "react";

const DEFAULT_ROTATE_MS = 5500;

/** Auto-advances `active` through [0, length) on a timer; stops itself once there's nothing left to rotate between. */
export function useCarouselRotation(length: number, intervalMs: number = DEFAULT_ROTATE_MS) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);

  return [active, setActive] as const;
}
