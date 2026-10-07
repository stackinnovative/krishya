"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";
import Spinner from "@/shared/ui/Spinner";
import { useButtonState } from "@/shared/ui/button/useButtonState";

export type StorefrontButtonVariant = "primary" | "outline" | "ghost";

// "ghost" carries no typography of its own - its usages vary too much
// (a borderless quantity stepper vs. a small text link) to bake in a size/
// weight without fighting the caller's own className on one of them.
const VARIANT_CLASS: Record<StorefrontButtonVariant, string> = {
  primary: "h-[52px] rounded-lg border border-ka-green bg-ka-green px-6 text-[15px] font-semibold text-ka-cream hover:bg-ka-green-dark",
  outline: "h-[52px] rounded-lg border border-ka-gold bg-transparent px-6 text-[15px] font-semibold text-ka-green hover:bg-ka-gold/[.12]",
  ghost: "",
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
 * Krishay palette (green primary, gold-outlined secondary).
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
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className ?? ""}`}
      style={style}
    >
      {content}
    </button>
  );
}
