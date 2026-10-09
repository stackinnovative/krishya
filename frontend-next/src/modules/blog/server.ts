import { cache } from "react";
import { env } from "@/lib/env";
import type { UserBlog } from "./types/blog.type";

/**
 * Server-component fetch for the article page. Fresh on every request so an
 * admin edit shows immediately, and React-`cache`d so the page and its
 * metadata share one fetch. Returns null when the article doesn't exist (or
 * isn't live yet) so the page can 404; throws on a backend failure so the
 * error page shows instead of a misleading "not found".
 */
export const getBlogBySlug = cache(async (slug: string): Promise<UserBlog | null> => {
  const res = await fetch(`${env.backendApiUrl}/blogs/slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Could not load article "${slug}" (${res.status})`);
  const json = await res.json();
  return json?.data ?? null;
});
