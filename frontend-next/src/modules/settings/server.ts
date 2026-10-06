import { env } from "@/lib/env";
import type { SettingsView } from "./types/settings.type";

/**
 * Server-component/layout equivalent of `useSettings` - the `GET /settings`
 * route is public, so this can run without auth from any server component,
 * layout, or `generateMetadata`. Fetched fresh on every request (no cache) so
 * an admin edit (store name, logo, maintenance toggle, delivery charge) shows
 * up immediately without a redeploy.
 */
export async function getSettings(): Promise<SettingsView | null> {
  try {
    const res = await fetch(`${env.backendApiUrl}/settings`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}
