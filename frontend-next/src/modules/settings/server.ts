import { cache } from "react";
import { env } from "@/lib/env";
import { toStoreInfo, type StoreInfo } from "./store-info";
import type { SettingsView } from "./types/settings.type";

/**
 * Server-component/layout equivalent of `useSettings` - the `GET /settings`
 * route is public, so this can run without auth from any server component,
 * layout, or `generateMetadata`. Fetched fresh on every request (no cache) so
 * an admin edit (store name, logo, maintenance toggle, delivery charge) shows
 * up immediately without a redeploy. Wrapped in React's `cache` so the
 * layout, footer, page and metadata of one request share a single fetch.
 */
export const getSettings = cache(async (): Promise<SettingsView | null> => {
  try {
    const res = await fetch(`${env.backendApiUrl}/settings`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
});

/** Store name, contact details, logo and delivery rules for server components. */
export const getStoreInfo = async (): Promise<StoreInfo> => toStoreInfo(await getSettings());
