/**
 * Route-level fallback shown while an admin route segment's chunk loads -
 * last resort for navigation, not for query data (each page/widget handles
 * its own request loading via AdminAsyncState/AdminTable). Matches
 * AdminGate's auth-check spinner so there's no visual flash between the two.
 */
export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1d1d1f]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
    </div>
  );
}
