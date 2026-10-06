"use client";

import { X } from "lucide-react";
import { inputStyle } from "../style-helpers";

const dateInputStyle = { ...inputStyle, width: "100%" };
const labelStyle = { color: "#8a8a8e" };

/**
 * From/to date filter built on two native <input type="date"> fields - no
 * date-range/calendar component or library exists elsewhere in this app
 * yet, and a native date input already gives an accessible, mobile-native
 * picker for free. Values are plain YYYY-MM-DD strings (exactly what the
 * input produces), passed straight through as query params - nothing here
 * parses or formats dates.
 *
 * Each input carries a visible "Start date"/"End date" label above it, not
 * just an aria-label - an empty native date input renders as a bare chevron
 * on mobile with no visible hint of what it's for, which read as two blank,
 * confusing dropdowns. `min-w` keeps each field wide enough for the
 * browser's own date UI to render legibly instead of being squeezed; on very
 * narrow screens the two fields wrap to their own rows instead of both
 * shrinking.
 */
export default function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const hasRange = !!from || !!to;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex min-w-[150px] flex-1 flex-col gap-1 text-[11px] font-semibold" style={labelStyle}>
        Start date
        <input type="date" value={from} max={to || undefined} onChange={(e) => onChange(e.target.value, to)} style={dateInputStyle} />
      </label>
      <label className="flex min-w-[150px] flex-1 flex-col gap-1 text-[11px] font-semibold" style={labelStyle}>
        End date
        <input type="date" value={to} min={from || undefined} onChange={(e) => onChange(from, e.target.value)} style={dateInputStyle} />
      </label>
      {hasRange && (
        <button
          type="button"
          title="Clear date range"
          onClick={() => onChange("", "")}
          className="flex h-[42px] w-9 flex-none items-center justify-center rounded-[10px] border border-[#ececea] bg-white text-[#8a8a8e] hover:text-[#141414]"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
