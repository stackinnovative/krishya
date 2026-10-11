import { cache } from "react";
import { env } from "@/lib/env";
import type { UserFaqGroup } from "./types/faq.type";

/**
 * Server-component fetch for the FAQ page - fresh on every request so an
 * admin edit shows immediately. Null when the backend can't be reached, so
 * the page can say so instead of pretending there are no questions.
 */
export const getFaqGroups = cache(async (): Promise<UserFaqGroup[] | null> => {
  try {
    const res = await fetch(`${env.backendApiUrl}/faqs/list`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
});
