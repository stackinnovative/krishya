export interface UseButtonStateOptions {
  disabled?: boolean;
  loading?: boolean;
  loadingText?: React.ReactNode;
  children: React.ReactNode;
  /** Caller's own themed spinner (colors/size differ per surface). */
  spinner: React.ReactNode;
}

export interface UseButtonStateResult {
  isDisabled: boolean;
  ariaBusy: boolean;
  content: React.ReactNode;
}

/**
 * Disabled/aria-busy/loading-content-swap kernel shared by every themed
 * button (admin's AdminButton, the storefront's Button) so loading state
 * looks and behaves the same everywhere regardless of each surface's own
 * visual styling.
 */
export function useButtonState({
  disabled,
  loading = false,
  loadingText,
  children,
  spinner,
}: UseButtonStateOptions): UseButtonStateResult {
  return {
    isDisabled: Boolean(disabled) || loading,
    ariaBusy: loading,
    content: (
      <>
        {loading && spinner}
        {loading && loadingText ? loadingText : children}
      </>
    ),
  };
}
