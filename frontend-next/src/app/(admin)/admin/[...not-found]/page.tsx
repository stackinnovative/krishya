import { notFound } from "next/navigation";

/**
 * Catches any /admin/* path with no matching route (e.g. a mistyped or
 * stale URL) and hands off to this segment's not-found.tsx. Next.js only
 * auto-renders a nested not-found.tsx when notFound() is called from a
 * matched route - it does NOT do so on its own for arbitrary unmatched
 * paths, which would otherwise fall through to the app-wide default 404.
 */
export default function AdminCatchAll(): never {
  notFound();
}
