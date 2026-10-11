"use client";

import { Menu, Search } from "lucide-react";
import SearchableSelect, { type SearchableSelectOption } from "./SearchableSelect";
import AdminBreadcrumbs, { type AdminBreadcrumb } from "./AdminBreadcrumbs";

export default function AdminTopbar({
  title,
  subtitle,
  onBurgerClick,
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  sortOptions,
  sortValue,
  onSortChange,
  breadcrumbs,
}: {
  title: string;
  subtitle: string;
  onBurgerClick: () => void;
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** Rendered next to the search box, mobile-only (om:hidden) - on desktop
   * the same sort control lives in AdminListFilterRow above the table
   * instead, so it isn't shown twice. */
  sortOptions?: SearchableSelectOption[];
  sortValue?: string;
  onSortChange?: (v: string) => void;
  breadcrumbs?: AdminBreadcrumb[];
}) {
  return (
    <div className="mb-[22px] flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <button
          onClick={onBurgerClick}
          className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[#e3e3e0] bg-white text-[#141414] om:hidden"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && <AdminBreadcrumbs items={breadcrumbs} />}
          <h1 className="m-0 text-[30px] font-bold leading-[1.1] tracking-[-.02em]">{title}</h1>
          <p className="mt-1.5 mb-0 text-[12.5px] text-[#8a8a8e]">{subtitle}</p>
        </div>
      </div>
      {onSearchChange && (
        <div className="flex w-full gap-2 om:w-auto">
          <div className="flex h-10 min-w-0 flex-[3] items-center gap-2 rounded-full border border-[#e9e9e6] bg-white px-4 om:w-[220px] om:flex-none">
            <Search size={15} color="#8a8a8e" className="flex-none" />
            <input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-[#141414] outline-none"
            />
          </div>
          {sortOptions && onSortChange && (
            <div className="min-w-0 flex-[2] om:hidden">
              <SearchableSelect options={sortOptions} value={sortValue ?? ""} onChange={onSortChange} searchable={false} placeholder="Sort" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
