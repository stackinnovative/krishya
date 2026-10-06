"use client";

import { useState } from "react";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import CategoriesPageContent, { CATEGORY_SORT_OPTIONS, type CategorySortValue } from "@/modules/categories/components/CategoriesPageContent";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CategorySortValue>("newest");
  return (
    <AdminPageShell
      title="Categories"
      subtitle="Group products so customers can browse"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by category name"
      sortOptions={[...CATEGORY_SORT_OPTIONS]}
      sortValue={sort}
      onSortChange={(v) => setSort(v as CategorySortValue)}
    >
      <CategoriesPageContent search={search} sort={sort} onSortChange={setSort} />
    </AdminPageShell>
  );
}
