import type { QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | null = null;

export const setQueryClient = (client: QueryClient) => {
  queryClient = client;
};

/**
 * Called when a token refresh fails (session truly expired). Clears cached
 * user/admin queries and bounces to the right login page - mirrors the old
 * SPA's behaviour so a dead session never gets stuck showing stale admin UI.
 */
export const logout = () => {
  queryClient?.clear();
  if (typeof window === "undefined") return;
  const isAdmin = window.location.pathname.startsWith("/admin");
  window.location.href = isAdmin ? "/admin/login" : "/login";
};
