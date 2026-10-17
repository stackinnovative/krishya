import { env } from "@/lib/env";
import type { StorefrontCategory } from "./types/storefront-category.type";

/**
 * Server-component equivalent of `useActiveCategories` (the footer's
 * category column) - fetches the backend directly like
 * `modules/settings/server.ts`, since the browser-side API client goes
 * through the relative /api/proxy rewrite that a server render can't use.
 */
export async function getActiveCategories(): Promise<StorefrontCategory[]> {
  try {
    const res = await fetch(`${env.backendApiUrl}/categories/list`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}
