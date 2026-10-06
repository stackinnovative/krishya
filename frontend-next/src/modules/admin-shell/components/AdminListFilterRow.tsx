"use client";

/**
 * The row of list-level controls (status filter pills, date range, sort)
 * that sits above the table card - shared by every admin list page (Products,
 * Categories, Orders, Users) so they stay pixel-identical instead of
 * drifting per page. Stacks to its own lines on mobile; from the `om`
 * breakpoint up, filters sit left and everything else (date range, sort)
 * sits right on one row.
 *
 * `right`'s sort control should itself be `hidden om:block` - on mobile the
 * same sort state already renders next to the search box in the topbar
 * (via AdminPageShell's sortOptions/sortValue/onSortChange), so it isn't
 * shown a second time here.
 */
export default function AdminListFilterRow({
  filters,
  right,
}: {
  filters?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className={`mb-4 flex flex-col gap-3 om:flex-row om:items-end ${filters ? "om:justify-between" : "om:justify-end"}`}>
      {filters && <div className="min-w-0">{filters}</div>}
      {right && <div className="flex flex-none flex-wrap items-end gap-2">{right}</div>}
    </div>
  );
}
