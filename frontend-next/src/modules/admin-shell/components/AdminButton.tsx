import type { ButtonHTMLAttributes, CSSProperties } from "react";
import Spinner from "@/shared/ui/Spinner";
import { useButtonState } from "@/shared/ui/button/useButtonState";
import { blackPillButton, whitePillButton, dangerPillButton } from "../style-helpers";

type Variant = "primary" | "secondary" | "danger";

const VARIANT_STYLE: Record<Variant, CSSProperties> = {
  primary: blackPillButton,
  secondary: whitePillButton,
  danger: { ...dangerPillButton, background: "#e5533f", color: "#fff" },
};

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
  variant?: Variant;
  /** True while the async action this button triggers is in flight. Disables the button, blocks re-clicks, and swaps in a spinner + loadingText. */
  loading?: boolean;
  loadingText?: string;
  style?: CSSProperties;
};

/**
 * Standard admin action button - covers every create/save/confirm button
 * across the admin dashboard so loading state (spinner, disabled, dimmed)
 * looks and behaves the same everywhere. Styled from the same pill tokens
 * as the rest of admin-shell, so it matches at any viewport.
 */
export default function AdminButton({
  variant = "primary",
  loading = false,
  loadingText,
  disabled,
  children,
  style,
  ...rest
}: Props) {
  const { isDisabled, ariaBusy, content } = useButtonState({
    disabled,
    loading,
    loadingText,
    children,
    spinner: <Spinner size={13} />,
  });

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={ariaBusy}
      style={{
        ...VARIANT_STYLE[variant],
        padding: "11px 22px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: isDisabled ? 0.6 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {content}
    </button>
  );
}
