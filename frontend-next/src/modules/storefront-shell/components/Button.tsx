"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";
import Spinner from "@/shared/ui/Spinner";
import { useButtonState } from "@/shared/ui/button/useButtonState";

export type StorefrontButtonVariant = "primary" | "outline" | "ghost";

// "ghost" carries no typography of its own - its usages vary too much
// (a borderless quantity stepper vs. a small text link) to bake in a size/
// weight without fighting the caller's own className on one of them.
const VARIANT_CLASS: Record<StorefrontButtonVariant, string> = {
  primary: "rounded-full py-3 text-sm font-semibold uppercase tracking-wide text-white",
  outline: "rounded-full border px-4 py-2 text-sm font-medium",
  ghost: "",
};

const variantStyle = (variant: StorefrontButtonVariant): CSSProperties => {
  if (variant === "primary") return { background: "var(--accent)" };
  if (variant === "outline") return { borderColor: "var(--border)", background: "transparent" };
  return {};
};

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
  variant?: StorefrontButtonVariant;
  /** True while the async action this button triggers is in flight. Disables the button, blocks re-clicks, and swaps in a spinner + loadingText. */
  loading?: boolean;
  loadingText?: React.ReactNode;
  style?: CSSProperties;
};

/**
 * Storefront's counterpart to admin's AdminButton - same loading/disabled/
 * aria-busy kernel (via the shared useButtonState hook), themed with the
 * storefront's CSS-variable palette instead of admin's hardcoded hex.
 */
export default function Button({
  variant = "primary",
  loading = false,
  loadingText,
  disabled,
  children,
  className,
  style,
  ...rest
}: Props) {
  const { isDisabled, ariaBusy, content } = useButtonState({
    disabled,
    loading,
    loadingText,
    children,
    spinner: <Spinner size={13} color="currentColor" />,
  });

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={ariaBusy}
      className={`inline-flex items-center justify-center gap-2 disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className ?? ""}`}
      style={{ ...variantStyle(variant), ...style }}
    >
      {content}
    </button>
  );
}
