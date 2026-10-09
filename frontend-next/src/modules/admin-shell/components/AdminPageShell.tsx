"use client";

import AdminGate from "@/modules/auth/components/AdminGate";
import AdminShell from "./AdminShell";
import type { SearchableSelectOption } from "./SearchableSelect";
import type { AdminBreadcrumb } from "./AdminBreadcrumbs";

export default function AdminPageShell({
  title,
  subtitle,
  search,
  onSearchChange,
  searchPlaceholder,
  sortOptions,
  sortValue,
  onSortChange,
  breadcrumbs,
  children,
}: {
  title: string;
  subtitle: string;
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** Renders the sort control next to search on mobile (om:hidden there past
   * the breakpoint) - pass the same sort state each page already renders via
   * AdminListFilterRow on desktop, so it shows exactly once per breakpoint. */
  sortOptions?: SearchableSelectOption[];
  sortValue?: string;
  onSortChange?: (v: string) => void;
  /** Trail above the title for pages below a module's list (e.g. Blog › Edit article) - see AdminBreadcrumbs. */
  breadcrumbs?: AdminBreadcrumb[];
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <AdminShell
        title={title}
        subtitle={subtitle}
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        breadcrumbs={breadcrumbs}
      >
        {children}
      </AdminShell>
    </AdminGate>
  );
}
