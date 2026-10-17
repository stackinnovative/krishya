"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Pencil } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminErrorBoundary from "@/modules/admin-shell/components/AdminErrorBoundary";
import AdminListFilterRow from "@/modules/admin-shell/components/AdminListFilterRow";
import StatusBadge from "@/modules/admin-shell/components/StatusBadge";
import ConfirmModal from "@/modules/admin-shell/components/ConfirmModal";
import FilterPills, { type FilterPillOption } from "@/modules/admin-shell/components/FilterPills";
import Pagination from "@/modules/admin-shell/components/Pagination";
import AdminTable, { type AdminTableColumn } from "@/modules/admin-shell/components/AdminTable";
import TruncatedText from "@/modules/admin-shell/components/TruncatedText";
import SearchableSelect from "@/modules/admin-shell/components/SearchableSelect";
import { blackPillButton, iconButtonStyle, softPillButton, whitePillButton } from "@/modules/admin-shell/style-helpers";
import { downloadCsv } from "@/modules/admin-shell/utils/csv";
import { useAdminProducts, useToggleProductStatus } from "@/modules/products/hooks/useAdminProducts";
import { useAdminCategories } from "@/modules/categories/hooks/useCategories";
import ProductWizard from "@/modules/products/components/wizard/ProductWizard";
import ProductViewModal from "@/modules/products/components/ProductViewModal";
import type { ProductListItem } from "@/modules/products/types/product.type";
import { PRODUCT_TYPE_LABELS } from "@/modules/products/constants/product-options";
import { formatCurrency } from "@/lib/format";

const FILTERS = ["All", "Featured", "Active", "Inactive"] as const;
type Filter = (typeof FILTERS)[number];

const PRODUCT_SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price: Low to High", value: "price_low_high" },
  { label: "Price: High to Low", value: "price_high_low" },
] as const;
type ProductSortValue = (typeof PRODUCT_SORT_OPTIONS)[number]["value"];

function ProductThumb({ image, size }: { image?: string; size: number }) {
  if (!image) {
    return (
      <div
        className="flex-none rounded-full"
        style={{ width: size, height: size, background: "linear-gradient(135deg,#d9b25a,#f5e2a0 60%,#c69a3a)" }}
      />
    );
  }
  return (
    <div className="relative flex-none overflow-hidden rounded-full" style={{ width: size, height: size }}>
      <Image src={getOptimizedImageUrl(image, size * 2)} alt="" fill sizes={`${size}px`} className="object-cover" />
    </div>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  // A status pill (All/Featured/Active/Inactive) or a category id - one pill row, one choice, like Orders.
  const [filter, setFilter] = useState<string>("All");
  const [sort, setSort] = useState<ProductSortValue>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [viewing, setViewing] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null | "new">(null);
  const [statusTarget, setStatusTarget] = useState<ProductListItem | null>(null);
  const { mutateAsync: toggleStatus } = useToggleProductStatus();

  useEffect(() => setPage(1), [search, filter, sort]);

  const query: Record<string, unknown> = { search, page, limit: pageSize, sort };
  if (filter === "Featured") query.isFeatured = true;
  if (filter === "Active") query.isActive = true;
  if (filter === "Inactive") query.isActive = false;
  if (!FILTERS.includes(filter as Filter)) query.categoryId = filter;

  // The category pills need every category, not a paginated page of them.
  const { data: categoriesRes } = useAdminCategories({ search: "", limit: 100 });
  const filterOptions: FilterPillOption<string>[] = [
    ...FILTERS,
    ...(categoriesRes?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  const { data, isLoading, isError, refetch } = useAdminProducts(query);
  const products = data?.data ?? [];

  const columns: AdminTableColumn<ProductListItem>[] = [
    {
      key: "product",
      header: "Product",
      width: 280,
      render: (p) => (
        <div onClick={() => setViewing(p.id)} className="flex cursor-pointer items-center gap-2.5">
          <ProductThumb image={p.image} size={34} />
          <div className="min-w-0 flex-1">
            <TruncatedText text={p.name} className="text-[13px] font-semibold" />
            <div className="text-[11px] text-[#8a8a8e]">
              {PRODUCT_TYPE_LABELS[p.type]} · {p.isFeatured ? "Featured" : "Standard"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      width: 130,
      render: (p) => <TruncatedText text={p.category?.name} className="text-[12.5px] text-[#555]" />,
    },
    {
      key: "price",
      header: "Price",
      width: 120,
      render: (p) => (
        <div className="text-[12.5px]">
          <span className="font-semibold">{formatCurrency(p.price)}</span>
          {p.discountPercent > 0 && (
            <div className="text-[11px] text-[#8a8a8e]">
              <s>{formatCurrency(p.mrp)}</s> <span style={{ color: "#2e9e4b" }}>{p.discountPercent}% off</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: 110,
      render: (p) => <StatusBadge status={p.isActive ? "Active" : "Inactive"} onClick={() => setStatusTarget(p)} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: 90,
      cellClassName: "whitespace-nowrap",
      render: (p) => (
        <>
          <button style={{ ...softPillButton, marginRight: 6 }} onClick={() => setViewing(p.id)}>
            View
          </button>
          <button style={iconButtonStyle} title="Edit" onClick={() => setEditing(p.id)}>
            <Pencil size={14} />
          </button>
        </>
      ),
    },
  ];

  const exportCsv = () => {
    downloadCsv(
      "artspace-products.csv",
      ["Name", "Category", "Type", "Price", "MRP", "Discount %", "Featured", "Status"],
      products.map((p) => [
        p.name,
        p.category?.name ?? "",
        PRODUCT_TYPE_LABELS[p.type],
        p.price,
        p.mrp,
        p.discountPercent,
        p.isFeatured ? "Yes" : "No",
        p.isActive ? "Active" : "Inactive",
      ]),
    );
  };

  const handleConfirmStatus = async () => {
    if (!statusTarget) return;
    await toggleStatus({ id: statusTarget.id, isActive: statusTarget.isActive });
    setStatusTarget(null);
  };

  return (
    <AdminPageShell
      title="Products"
      subtitle="Add, edit and stock your catalogue"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by product name"
      sortOptions={[...PRODUCT_SORT_OPTIONS]}
      sortValue={sort}
      onSortChange={(v) => setSort(v as ProductSortValue)}
    >
      <AdminListFilterRow
        filters={<FilterPills options={filterOptions} value={filter} onChange={setFilter} />}
        right={
          <div className="hidden w-40 om:block">
            <SearchableSelect options={[...PRODUCT_SORT_OPTIONS]} value={sort} onChange={(v) => setSort(v as ProductSortValue)} searchable={false} placeholder="Sort" />
          </div>
        }
      />

      <AdminCard>
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <button style={{ ...whitePillButton, display: "inline-flex", alignItems: "center", gap: 8 }} onClick={exportCsv}>
            <Download size={14} /> Export CSV
          </button>
          <button style={blackPillButton} onClick={() => setEditing("new")}>
            + Add Product
          </button>
        </div>

        <AdminErrorBoundary>
          <AdminTable
            columns={columns}
            rows={products}
            getRowKey={(p) => p.id}
            minWidth={710}
            compact
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            errorMessage="Products couldn't load."
            emptyMessage="No products match."
            renderMobileCard={(p) => (
              <div className="rounded-2xl border border-[#f0f0ee] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div onClick={() => setViewing(p.id)} className="flex min-w-0 flex-1 items-center gap-2.5">
                    <ProductThumb image={p.image} size={44} />
                    <div className="min-w-0 flex-1">
                      <TruncatedText text={p.name} className="text-[13.5px] font-semibold" />
                      <div className="truncate text-[11.5px] text-[#8a8a8e]">{p.category?.name}</div>
                    </div>
                  </div>
                  <StatusBadge status={p.isActive ? "Active" : "Inactive"} onClick={() => setStatusTarget(p)} />
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="text-[15px] font-bold">₹{p.price.toLocaleString("en-IN")}</div>
                  <div className="flex gap-1.5">
                    <button style={softPillButton} onClick={() => setViewing(p.id)}>
                      View
                    </button>
                    <button style={{ ...softPillButton, display: "inline-flex", alignItems: "center", gap: 4 }} onClick={() => setEditing(p.id)}>
                      <Pencil size={12} /> Edit
                    </button>
                  </div>
                </div>
              </div>
            )}
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

      {viewing && <ProductViewModal productId={viewing} onClose={() => setViewing(null)} onEdit={() => { setEditing(viewing); setViewing(null); }} />}
      {editing !== null && <ProductWizard productId={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

      {statusTarget && (
        <ConfirmModal
          title={statusTarget.isActive ? "Deactivate product?" : "Activate product?"}
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
    </AdminPageShell>
  );
}
