"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import type { SearchableSelectOption } from "./SearchableSelect";

export default function AdminShell({
  title,
  subtitle,
  search,
  onSearchChange,
  searchPlaceholder,
  sortOptions,
  sortValue,
  onSortChange,
  children,
}: {
  title: string;
  subtitle: string;
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  sortOptions?: SearchableSelectOption[];
  sortValue?: string;
  onSortChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#1d1d1f]">
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-[55] bg-black/45 om:hidden"
        />
      )}

      <AdminSidebar open={drawerOpen} onNavigate={() => setDrawerOpen(false)} />

      <main className="min-h-screen min-w-0 flex-1 overflow-hidden rounded-none bg-[#f1f1ef] om:my-2.5 om:mr-2.5 om:ml-0 om:rounded-[28px]">
        <div className="mx-auto max-w-[1400px] box-border px-4 pb-10 pt-[18px] om:px-8 om:pb-10 om:pt-[26px]">
          <AdminTopbar
            title={title}
            subtitle={subtitle}
            onBurgerClick={() => setDrawerOpen(true)}
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
            sortOptions={sortOptions}
            sortValue={sortValue}
            onSortChange={onSortChange}
          />
          {children}
        </div>
      </main>
    </div>
  );
}
