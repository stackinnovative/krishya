"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Pencil, Star, Trash2 } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatDate } from "@/lib/format";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminErrorBoundary from "@/modules/admin-shell/components/AdminErrorBoundary";
import AdminListFilterRow from "@/modules/admin-shell/components/AdminListFilterRow";
import StatusBadge from "@/modules/admin-shell/components/StatusBadge";
import ConfirmModal from "@/modules/admin-shell/components/ConfirmModal";
import FilterPills from "@/modules/admin-shell/components/FilterPills";
import Pagination from "@/modules/admin-shell/components/Pagination";
import AdminTable, { type AdminTableColumn } from "@/modules/admin-shell/components/AdminTable";
import TruncatedText from "@/modules/admin-shell/components/TruncatedText";
import SearchableSelect from "@/modules/admin-shell/components/SearchableSelect";
import { blackPillButton, dangerIconButtonStyle, iconButtonStyle, softPillButton } from "@/modules/admin-shell/style-helpers";
import { useAdminBlogs, useDeleteBlog, useToggleBlogStatus } from "@/modules/blog/hooks/useAdminBlogs";
import { BLOG_CATEGORIES } from "@/modules/blog/constants";
import type { AdminBlogListItem } from "@/modules/blog/types/blog.type";

const FILTERS = ["All", "Published", "Drafts"] as const;
type Filter = (typeof FILTERS)[number];

const SORT_OPTIONS = [
  { label: "Recently edited", value: "newest" },
  { label: "Oldest edits first", value: "oldest" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const CATEGORY_OPTIONS = [{ label: "All categories", value: "" }, ...BLOG_CATEGORIES.map((c) => ({ label: c, value: c }))];

const isScheduled = (b: AdminBlogListItem) => b.status === "published" && !!b.publishedAt && new Date(b.publishedAt).getTime() > Date.now();
const statusLabel = (b: AdminBlogListItem) => (isScheduled(b) ? "Scheduled" : b.status === "published" ? "Published" : "Draft");

function CoverThumb({ blog, size }: { blog: AdminBlogListItem; size: number }) {
  const height = Math.round(size / 1.5);
  return (
    <div className="relative flex-none overflow-hidden rounded-lg bg-[#f1f1ef] text-[#b4b4b0]" style={{ width: size, height }}>
      {blog.coverImage ? (
        <Image src={getOptimizedImageUrl(blog.coverImage.url, size * 2, height * 2)} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span className="grid h-full place-items-center">
          <FileText size={16} />
        </span>
      )}
    </div>
  );
}

export default function BlogAdminPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortValue>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [statusTarget, setStatusTarget] = useState<AdminBlogListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogListItem | null>(null);
  const { mutateAsync: toggleStatus } = useToggleBlogStatus();
  const { mutateAsync: deleteBlog } = useDeleteBlog();

  useEffect(() => setPage(1), [search, filter, category, sort]);

  const query: Record<string, unknown> = { search, page, limit: pageSize, sort };
  if (filter === "Published") query.status = "published";
  if (filter === "Drafts") query.status = "draft";
  if (category) query.category = category;

  const { data, isLoading, isError, refetch } = useAdminBlogs(query);
  const blogs = data?.data ?? [];
  const filtered = Boolean(search || category || filter !== "All");

  const columns: AdminTableColumn<AdminBlogListItem>[] = [
    {
      key: "article",
      header: "Article",
      width: 330,
      render: (b) => (
        <Link href={`/admin/blog/${b.id}`} className="flex items-center gap-2.5">
          <CoverThumb blog={b} size={54} />
          <div className="min-w-0 flex-1">
            <TruncatedText text={b.title} className="text-[13px] font-semibold" />
            <div className="flex items-center gap-1 truncate text-[11px] text-[#8a8a8e]">
              {b.isFeatured && <Star size={11} className="flex-none fill-[#c69a3a] text-[#c69a3a]" aria-label="Featured" />}
              <span className="truncate">/blog/{b.slug}</span>
            </div>
          </div>
        </Link>
      ),
    },
    { key: "category", header: "Category", width: 140, render: (b) => <TruncatedText text={b.category} className="text-[12.5px] text-[#555]" /> },
    {
      key: "status",
      header: "Status",
      width: 110,
      render: (b) => <StatusBadge status={statusLabel(b)} onClick={() => setStatusTarget(b)} />,
    },
    {
      key: "date",
      header: "Publish date",
      width: 120,
      render: (b) => <span className="text-[12.5px] text-[#555]">{b.publishedAt ? formatDate(b.publishedAt) : "—"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: 100,
      cellClassName: "whitespace-nowrap",
      render: (b) => (
        <>
          <Link href={`/admin/blog/${b.id}`} style={{ ...iconButtonStyle, marginRight: 6, display: "inline-grid", placeItems: "center" }} title="Edit" aria-label={`Edit ${b.title}`}>
            <Pencil size={14} />
          </Link>
          <button style={dangerIconButtonStyle} title="Delete" aria-label={`Delete ${b.title}`} onClick={() => setDeleteTarget(b)}>
            <Trash2 size={14} />
          </button>
        </>
      ),
    },
  ];

  const handleConfirmStatus = async () => {
    if (!statusTarget) return;
    await toggleStatus({ id: statusTarget.id, status: statusTarget.status });
    setStatusTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteBlog(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <AdminPageShell
      title="Blog"
      subtitle="Write and publish articles for the Journal"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by title or summary"
      sortOptions={[...SORT_OPTIONS]}
      sortValue={sort}
      onSortChange={(v) => setSort(v as SortValue)}
    >
      <AdminListFilterRow
        filters={<FilterPills options={FILTERS} value={filter} onChange={setFilter} />}
        right={
          <>
            <div className="w-44">
              <SearchableSelect options={CATEGORY_OPTIONS} value={category} onChange={setCategory} searchable={false} placeholder="All categories" />
            </div>
            <div className="hidden w-44 om:block">
              <SearchableSelect options={[...SORT_OPTIONS]} value={sort} onChange={(v) => setSort(v as SortValue)} searchable={false} placeholder="Sort" />
            </div>
          </>
        }
      />

      <AdminCard>
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <Link href="/admin/blog/new" style={blackPillButton}>
            + New Article
          </Link>
        </div>

        <AdminErrorBoundary>
          <AdminTable
            columns={columns}
            rows={blogs}
            getRowKey={(b) => b.id}
            minWidth={800}
            compact
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            errorMessage="Articles couldn't load."
            emptyMessage={filtered ? "No articles match." : "No articles yet - write the first one with + New Article."}
            renderMobileCard={(b) => (
              <div className="rounded-2xl border border-[#f0f0ee] p-3">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/blog/${b.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                    <CoverThumb blog={b} size={60} />
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-[13.5px] font-semibold leading-snug">{b.title}</div>
                      <div className="truncate text-[11.5px] text-[#8a8a8e]">{b.category}</div>
                    </div>
                  </Link>
                  <StatusBadge status={statusLabel(b)} onClick={() => setStatusTarget(b)} />
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="text-[12px] text-[#8a8a8e]">{b.publishedAt ? formatDate(b.publishedAt) : "Not published"}</div>
                  <div className="flex gap-1.5">
                    <Link href={`/admin/blog/${b.id}`} style={{ ...softPillButton, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Pencil size={12} /> Edit
                    </Link>
                    <button style={dangerIconButtonStyle} aria-label={`Delete ${b.title}`} onClick={() => setDeleteTarget(b)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          />
        </AdminErrorBoundary>

        <Pagination page={page} totalPages={data?.totalPages ?? 1} total={data?.total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </AdminCard>

      {statusTarget && (
        <ConfirmModal
          title={statusTarget.status === "published" ? "Move to drafts?" : "Publish article?"}
          message={
            statusTarget.status === "published"
              ? `"${statusTarget.title}" will be hidden from the Journal until you publish it again.`
              : statusTarget.coverImage
                ? `"${statusTarget.title}" will go live on the Journal${statusTarget.publishedAt && new Date(statusTarget.publishedAt).getTime() > Date.now() ? ` on ${formatDate(statusTarget.publishedAt)}` : ""}.`
                : `"${statusTarget.title}" has no cover photo yet - open it and add one before publishing.`
          }
          confirmLabel={statusTarget.status === "published" ? "Move to drafts" : "Publish"}
          tone={statusTarget.status === "published" ? "danger" : "default"}
          onConfirm={handleConfirmStatus}
          onClose={() => setStatusTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete article?"
          message={`"${deleteTarget.title}" and its photos will be deleted for good. This can't be undone.`}
          confirmLabel="Delete"
          tone="danger"
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </AdminPageShell>
  );
}
