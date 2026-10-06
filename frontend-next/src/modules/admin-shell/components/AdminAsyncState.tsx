"use client";

import type { ReactNode } from "react";
import AdminErrorBoundary from "./AdminErrorBoundary";
import AdminErrorFallback from "./AdminErrorFallback";

/**
 * Standard per-widget wrapper for a React Query-backed section: skeleton
 * while loading, a retryable error card on isError, otherwise the real
 * content - all inside an AdminErrorBoundary so a render-time crash in
 * `children` is contained here too. Use one of these per independent data
 * source (per dashboard card/chart, per table) rather than one big gate
 * around a whole page, so a single failure stays local.
 */
export default function AdminAsyncState({
  isLoading,
  isError,
  onRetry,
  skeleton,
  errorTitle,
  errorMessage,
  compact = false,
  children,
}: {
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  skeleton: ReactNode;
  errorTitle?: string;
  errorMessage?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <AdminErrorBoundary compact={compact} title={errorTitle} message={errorMessage}>
      {isError ? (
        <AdminErrorFallback title={errorTitle} message={errorMessage} onRetry={onRetry} compact={compact} />
      ) : isLoading ? (
        skeleton
      ) : (
        children
      )}
    </AdminErrorBoundary>
  );
}
