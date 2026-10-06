"use client";

import { statusStyle } from "../style-helpers";

/** Fixed so "Active" and "Inactive" render at the exact same width - a
 * plain inline-block badge sizes itself to its text, so toggling between
 * the two different-length words shifted the whole Status column (and
 * everything after it) width by a few pixels on every click, which read as
 * the table jittering/jumping. Wide enough for "Inactive" at this font size
 * with room to spare for any other status word this badge ever shows. */
const FIXED_WIDTH = 86;

export default function StatusBadge({ status, onClick }: { status: string; onClick?: () => void }) {
  return (
    <span
      style={{
        ...statusStyle(status),
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: FIXED_WIDTH,
        boxSizing: "border-box",
      }}
      // Stops the click from also bubbling up to a clickable row (e.g. the
      // Users table's onRowClick) - without this, toggling the badge would
      // also open that row's detail modal.
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}
      title={onClick ? "Click to toggle" : undefined}
    >
      {status}
    </span>
  );
}
