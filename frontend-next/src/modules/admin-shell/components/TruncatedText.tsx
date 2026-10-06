"use client";

import Tooltip from "@/shared/ui/tooltip/Tooltip";

/**
 * One-line text that clips with an ellipsis inside whatever fixed-width box
 * it's placed in, and reveals the full value in a tooltip - but only when
 * it's actually cut off. Built for AdminTable cells: pair a column's fixed
 * `width` with this instead of letting the cell (and the whole table) grow
 * to fit long content.
 */
export default function TruncatedText({
  text,
  className,
}: {
  text: string | number | null | undefined;
  className?: string;
}) {
  const display = text === null || text === undefined || text === "" ? "—" : String(text);
  if (display === "—") return <span className={className}>{display}</span>;

  return (
    <Tooltip content={display} whenTruncated>
      <span className={`block truncate ${className ?? ""}`}>{display}</span>
    </Tooltip>
  );
}
