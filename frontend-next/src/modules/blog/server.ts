import { cache } from "react";
import { env } from "@/lib/env";
import type { UserBlog } from "./types/blog.type";

/**
 * Server-component fetch for the article page. Fresh on every request so an
 * admin edit shows immediately, and React-`cache`d so the page and its
 * metadata share one fetch. Null when the article doesn't exist, isn't live
 * yet, or can't be loaded - the page then 404s, like the product page does.
 */
export const getBlogBySlug = cache(async (slug: string): Promise<UserBlog | null> => {
  try {
    const res = await fetch(`${env.backendApiUrl}/blogs/slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
});
