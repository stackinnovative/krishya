"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import SearchableSelect from "./SearchableSelect";
import { pill, iconButtonStyle } from "../style-helpers";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

/** 1 / … / 4 5 6 / … / 20 style page list - every page for a short run, an ellipsis-trimmed window of the current page's neighbours plus the first/last page once there are more than 7. */
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...keep].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

/**
 * Classic numbered pagination + a rows-per-page selector - the reusable
 * footer every admin list table (categories, products, orders, ...) should
 * render instead of hand-rolling its own page controls. Deliberately not
 * infinite-scroll: callers own `page`/`pageSize` state and pass the
 * backend's `totalPages` (and optionally `total`, for the "X–Y of Z" label)
 * straight through.
 */
export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: {
  page: number;
  totalPages: number;
  total?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}) {
  const rangeStart = total ? (page - 1) * pageSize + 1 : undefined;
  const rangeEnd = total ? Math.min(page * pageSize, total) : undefined;

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-[#f3f3f1] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5 text-[12px] text-[#8a8a8e]">
        <span className="whitespace-nowrap">Rows per page</span>
        <div className="w-[84px]">
          <SearchableSelect
            options={pageSizeOptions.map((n) => ({ label: String(n), value: String(n) }))}
            value={String(pageSize)}
            onChange={(v) => {
              onPageSizeChange(Number(v));
              onPageChange(1);
            }}
            searchable={false}
          />
        </div>
        {rangeStart !== undefined && rangeEnd !== undefined && (
          <span className="whitespace-nowrap">
            {rangeStart}–{rangeEnd} of {total}
          </span>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            title="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={{ ...iconButtonStyle, ...(page <= 1 ? { opacity: 0.5, cursor: "not-allowed" } : null) }}
          >
            <ChevronLeft size={14} />
          </button>

          {getPageNumbers(page, totalPages).map((p, i) =>
            p === "ellipsis" ? (
              <span key={`e${i}`} className="px-1 text-[12px] text-[#8a8a8e]">
                …
              </span>
            ) : (
              <button key={p} style={{ ...pill(p === page), minWidth: 34, padding: "9px 12px", textAlign: "center" }} onClick={() => onPageChange(p)}>
                {p}
              </button>
            ),
          )}

          <button
            type="button"
            title="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={{ ...iconButtonStyle, ...(page >= totalPages ? { opacity: 0.5, cursor: "not-allowed" } : null) }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
