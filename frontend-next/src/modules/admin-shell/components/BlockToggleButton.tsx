"use client";

import type { ButtonHTMLAttributes } from "react";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { softPillButton } from "../style-helpers";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style"> & {
  blocked: boolean;
  /** Included in the accessible label, e.g. an article or customer name. */
  subject?: string;
};

/** Fixed-size admin action. The caller owns confirmation and the block/unblock request. */
export default function BlockToggleButton({ blocked, subject, disabled, ...rest }: Props) {
  const label = blocked ? "Unblock" : "Block";
  const Icon = blocked ? LockKeyholeOpen : LockKeyhole;

  return (
    <button
      type="button"
      title={label}
      aria-label={subject ? `${label} ${subject}` : label}
      {...rest}
      disabled={disabled}
      style={{
        ...softPillButton,
        boxSizing: "border-box",
        width: 92,
        height: 32,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        whiteSpace: "nowrap",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <Icon size={13} aria-hidden="true" className="shrink-0" />
      {label}
    </button>
  );
}
