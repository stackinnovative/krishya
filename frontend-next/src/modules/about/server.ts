import { cache } from "react";
import { env } from "@/lib/env";
import { ABOUT_FALLBACK } from "./constants";
import type { AboutView } from "./types/about.type";

/**
 * Server-component equivalent of `useAbout` for the About page. Fetched fresh
 * on every request (like settings) so an admin save shows immediately, and
 * React-`cache`d so the page and its metadata share one fetch. Falls back to
 * the default story if the backend can't be reached - the page never renders empty.
 */
export const getAbout = cache(async (): Promise<AboutView> => {
  try {
    const res = await fetch(`${env.backendApiUrl}/about`, { cache: "no-store" });
    if (!res.ok) return ABOUT_FALLBACK;
    const json = await res.json();
    return json?.data ?? ABOUT_FALLBACK;
  } catch {
    return ABOUT_FALLBACK;
  }
});
