"use client";

import { useEffect, useState } from "react";
import { Download, Pencil } from "lucide-react";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminErrorBoundary from "@/modules/admin-shell/components/AdminErrorBoundary";
import AdminListFilterRow from "@/modules/admin-shell/components/AdminListFilterRow";
import FilterPills from "@/modules/admin-shell/components/FilterPills";
import StatusBadge from "@/modules/admin-shell/components/StatusBadge";
import FormModal, { type FormFieldDef } from "@/modules/admin-shell/components/FormModal";
import ConfirmModal from "@/modules/admin-shell/components/ConfirmModal";
import Pagination from "@/modules/admin-shell/components/Pagination";
import AdminTable, { type AdminTableColumn } from "@/modules/admin-shell/components/AdminTable";
import TruncatedText from "@/modules/admin-shell/components/TruncatedText";
import SearchableSelect from "@/modules/admin-shell/components/SearchableSelect";
import { blackPillButton, iconButtonStyle, whitePillButton } from "@/modules/admin-shell/style-helpers";
import { downloadCsv, storeCsvFileName } from "@/modules/admin-shell/utils/csv";
import { useStoreContact } from "@/modules/storefront-shell/hooks/useStoreContact";
import { useAdminCategories, useSaveCategory, useToggleCategoryStatus } from "../hooks/useCategories";
import type { CategoryListItem } from "../types/category.type";
import { CATEGORY_ICON_MAP, CATEGORY_ICON_OPTIONS, type CategoryIconName } from "../constants/category-icons";

// Status isn't part of this form - it's toggled from the table badge (with
// a confirmation step). The slug is built from the name on create and never
// changes, so it isn't editable here either.
const FIELDS: FormFieldDef[] = [
  { key: "name", label: "Name", type: "text", placeholder: "e.g. Hair Care", required: true, maxLength: 100 },
  { key: "description", label: "Description", type: "area", placeholder: "Short description shown on the storefront", maxLength: 200 },
  { key: "icon", label: "Icon", type: "icon", iconOptions: CATEGORY_ICON_OPTIONS, required: true, hint: "Shown on the home page tiles and shop filters." },
  {
    key: "sortOrder",
    label: "Sort order",
    type: "number",
    hint: "Lower numbers show first on the storefront.",
    validate: (v) => (typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 999 ? null : "Sort order must be a whole number from 0 to 999."),
  },
];

export const CATEGORY_SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Name: A to Z", value: "name_asc" },
  { label: "Name: Z to A", value: "name_desc" },
] as const;
export type CategorySortValue = (typeof CATEGORY_SORT_OPTIONS)[number]["value"];

const FILTERS = ["All", "Active", "Inactive"] as const;
type Filter = (typeof FILTERS)[number];

export default function CategoriesPageContent({
  search,
  sort,
  onSortChange,
}: {
  search: string;
  sort: CategorySortValue;
  onSortChange: (v: CategorySortValue) => void;
}) {
  const { storeName } = useStoreContact();
  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  useEffect(() => setPage(1), [search, sort, filter]);

  const query: Record<string, unknown> = { search, page, limit: pageSize, sort };
  if (filter === "Active") query.isActive = true;
  if (filter === "Inactive") query.isActive = false;

  const { data, isLoading, isError, refetch } = useAdminCategories(query);
  const { mutateAsync: save } = useSaveCategory();
  const { mutateAsync: toggleStatus } = useToggleCategoryStatus();
  const [editing, setEditing] = useState<CategoryListItem | "new" | null>(null);
  const [statusTarget, setStatusTarget] = useState<CategoryListItem | null>(null);

  const categories = data?.data ?? [];

  const columns: AdminTableColumn<CategoryListItem>[] = [
    {
      key: "icon",
      header: "Icon",
      width: 60,
      render: (c) => {
        const Icon = CATEGORY_ICON_MAP[c.icon];
        return Icon ? <Icon size={16} color="#555" /> : null;
      },
    },
    { key: "name", header: "Name", width: 160, render: (c) => <TruncatedText text={c.name} className="text-[13px] font-semibold" /> },
    { key: "slug", header: "Link", width: 150, render: (c) => <TruncatedText text={`/shop/${c.slug}`} className="text-[12px] text-[#8a8a8e]" /> },
    { key: "sortOrder", header: "Order", width: 70, render: (c) => <span className="text-[12.5px] text-[#555]">{c.sortOrder}</span> },
    { key: "description", header: "Description", width: 330, render: (c) => <TruncatedText text={c.description} className="text-[12.5px] text-[#555]" /> },
    {
      key: "status",
      header: "Status",
      width: 110,
      render: (c) => <StatusBadge status={c.isActive ? "Active" : "Inactive"} onClick={() => setStatusTarget(c)} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: 90,
      cellClassName: "whitespace-nowrap",
      render: (c) => (
        <button style={iconButtonStyle} title="Edit" onClick={() => setEditing(c)}>
          <Pencil size={14} />
        </button>
      ),
    },
  ];

  const exportCsv = () => {
    downloadCsv(
      storeCsvFileName(storeName, "categories"),
      ["Name", "Slug", "Icon", "Sort order", "Description", "Status"],
      categories.map((c) => [c.name, c.slug, c.icon, String(c.sortOrder), c.description ?? "", c.isActive ? "Active" : "Inactive"]),
    );
  };

  const closeModal = () => setEditing(null);

  const handleSave = async (values: Record<string, unknown>) => {
    const id = editing && editing !== "new" ? editing.id : null;
    await save({
      id,
      data: {
        name: String(values.name ?? ""),
        description: String(values.description ?? ""),
        icon: values.icon as CategoryIconName,
        sortOrder: Number(values.sortOrder ?? 0),
      },
    });
    closeModal();
  };

  const handleConfirmStatus = async () => {
    if (!statusTarget) return;
    await toggleStatus({ id: statusTarget.id, isActive: statusTarget.isActive });
    setStatusTarget(null);
  };

  return (
    <>
      <AdminListFilterRow
        filters={<FilterPills options={FILTERS} value={filter} onChange={setFilter} />}
        right={
          <div className="hidden w-40 om:block">
            <SearchableSelect options={[...CATEGORY_SORT_OPTIONS]} value={sort} onChange={(v) => onSortChange(v as CategorySortValue)} searchable={false} placeholder="Sort" />
          </div>
        }
      />

      <AdminCard>
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <button style={{ ...whitePillButton, display: "inline-flex", alignItems: "center", gap: 8 }} onClick={exportCsv}>
            <Download size={14} /> Export CSV
          </button>
          <button style={blackPillButton} onClick={() => setEditing("new")}>
            + Add Category
          </button>
        </div>

        <AdminErrorBoundary>
          <AdminTable
            columns={columns}
            rows={categories}
            getRowKey={(c) => c.id}
            minWidth={960}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            errorMessage="Categories couldn't load."
            emptyMessage="No categories match your search."
          />
        </AdminErrorBoundary>

        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          total={data?.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </AdminCard>

      {editing && (
        <FormModal
          title={editing === "new" ? "Add Category" : "Edit Category"}
          fields={FIELDS}
          initialValues={
            editing === "new"
              ? { name: "", description: "", icon: "", sortOrder: 0 }
              : { name: editing.name, description: editing.description, icon: editing.icon, sortOrder: editing.sortOrder }
          }
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {statusTarget && (
        <ConfirmModal
          title={statusTarget.isActive ? "Deactivate category?" : "Activate category?"}
          message={
            statusTarget.isActive
              ? `"${statusTarget.name}" will be hidden from the storefront until you reactivate it.`
              : `"${statusTarget.name}" will become visible on the storefront again.`
          }
          confirmLabel={statusTarget.isActive ? "Deactivate" : "Activate"}
          tone={statusTarget.isActive ? "danger" : "default"}
          onConfirm={handleConfirmStatus}
          onClose={() => setStatusTarget(null)}
        />
      )}
    </>
  );
}
