import type { ReactNode } from "react";
import Skeleton from "./Skeleton";
import AdminErrorFallback from "./AdminErrorFallback";

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  /** Fixed pixel width for this column. Once any column sets this, the table
   * switches to a fixed layout (via <colgroup>) so column widths come only
   * from these numbers - never from cell content - and stay put when a
   * status badge or other cell value changes length. Give every column a
   * width when using this on a table (sum them into `minWidth` too). */
  width?: number;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T) => ReactNode;
};

export default function AdminTable<T>({
  columns,
  rows,
  getRowKey,
  minWidth,
  onRowClick,
  renderMobileCard,
  dense = false,
  compact = false,
  isLoading = false,
  isError = false,
  onRetry,
  errorMessage,
  skeletonRows = 6,
  emptyMessage,
}: {
  columns: AdminTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  minWidth?: number;
  onRowClick?: (row: T) => void;
  renderMobileCard?: (row: T) => ReactNode;
  /** Header + body both use the tighter px-2.5 py-2.5 padding (Dashboard's "Recent Orders" widget). */
  dense?: boolean;
  /** Body cells use py-3 instead of the default py-3.5; header padding is unaffected (Products/Revenue). */
  compact?: boolean;
  isLoading?: boolean;
  /** Replaces the table with a retryable error card - pass the query's isError/refetch. */
  isError?: boolean;
  onRetry?: () => void;
  errorMessage?: string;
  /** Number of skeleton rows shown while isLoading and there's no data yet. */
  skeletonRows?: number;
  emptyMessage?: string;
}) {
  const headerPadding = dense ? "px-2.5 py-2.5" : "px-3 py-2.5";
  const bodyPadding = dense ? "px-2.5 py-2.5" : compact ? "px-3 py-3" : "px-3 py-3.5";
  const rowClassName = onRowClick ? "cursor-pointer hover:bg-[#fafaf8]" : "hover:bg-[#fafaf8]";
  const fixedLayout = columns.some((c) => c.width);

  if (isError) {
    return (
      <AdminErrorFallback
        title="Couldn't load this data"
        message={errorMessage ?? "Something went wrong while fetching this table. Please try again."}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading && rows.length === 0) {
    const skeletonTable = (
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse"
          style={{ ...(fixedLayout ? { tableLayout: "fixed" } : undefined), ...(minWidth ? { minWidth } : undefined) }}
        >
          {fixedLayout && (
            <colgroup>
              {columns.map((c) => (
                <col key={c.key} style={c.width ? { width: c.width } : undefined} />
              ))}
            </colgroup>
          )}
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`truncate border-b border-[#eeeeec] ${headerPadding} ${c.align === "right" ? "text-right" : "text-left"} text-[11.5px] font-semibold text-[#8a8a8e] ${c.headerClassName ?? ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key} className={`border-b border-[#f3f3f1] ${bodyPadding}`}>
                    <Skeleton className="h-3.5" style={{ width: c.width ? Math.max(24, Math.min(c.width - 24, 140)) : "70%" }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    return (
      <>
        <div className={renderMobileCard ? "hidden om:block" : ""}>{skeletonTable}</div>
        {renderMobileCard && (
          <div className="flex flex-col gap-2.5 om:hidden">
            {Array.from({ length: Math.min(skeletonRows, 4) }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#f0f0ee] p-3.5">
                <Skeleton className="mb-2 h-3.5 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  const table = (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse"
        style={{ ...(fixedLayout ? { tableLayout: "fixed" } : undefined), ...(minWidth ? { minWidth } : undefined) }}
      >
        {fixedLayout && (
          <colgroup>
            {columns.map((c) => (
              <col key={c.key} style={c.width ? { width: c.width } : undefined} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`truncate border-b border-[#eeeeec] ${headerPadding} ${c.align === "right" ? "text-right" : "text-left"} text-[11.5px] font-semibold text-[#8a8a8e] ${c.headerClassName ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined} className={rowClassName}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`border-b border-[#f3f3f1] ${bodyPadding} ${c.align === "right" ? "text-right" : ""} ${c.cellClassName ?? ""}`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {renderMobileCard ? (
        <>
          <div className="hidden om:block">{table}</div>
          <div className="flex flex-col gap-2.5 om:hidden">
            {rows.map((row) => (
              <div key={getRowKey(row)}>{renderMobileCard(row)}</div>
            ))}
          </div>
        </>
      ) : (
        table
      )}

      {!isLoading && rows.length === 0 && emptyMessage && (
        <div className="py-8 text-center text-[13px] text-[#8a8a8e]">{emptyMessage}</div>
      )}
    </>
  );
}
