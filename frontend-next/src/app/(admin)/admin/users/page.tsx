"use client";

import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminErrorBoundary from "@/modules/admin-shell/components/AdminErrorBoundary";
import AdminListFilterRow from "@/modules/admin-shell/components/AdminListFilterRow";
import Pagination from "@/modules/admin-shell/components/Pagination";
import AdminTable, { type AdminTableColumn } from "@/modules/admin-shell/components/AdminTable";
import TruncatedText from "@/modules/admin-shell/components/TruncatedText";
import SearchableSelect from "@/modules/admin-shell/components/SearchableSelect";
import FilterPills from "@/modules/admin-shell/components/FilterPills";
import FormModal, { type FormFieldDef } from "@/modules/admin-shell/components/FormModal";
import StatusBadge from "@/modules/admin-shell/components/StatusBadge";
import ConfirmModal from "@/modules/admin-shell/components/ConfirmModal";
import { blackPillButton, whitePillButton } from "@/modules/admin-shell/style-helpers";
import { downloadCsv } from "@/modules/admin-shell/utils/csv";
import { formatDate } from "@/lib/format";
import { useAdminUsers, useCreateAdminUser, useToggleUserStatus } from "@/modules/users/hooks/useAdminUsers";
import UserDetailModal from "@/modules/users/components/UserDetailModal";
import type { AdminUserListItem, CreateUserPayload } from "@/modules/users/types/user.type";

const USER_SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Name: A to Z", value: "name_asc" },
  { label: "Name: Z to A", value: "name_desc" },
] as const;
type UserSortValue = (typeof USER_SORT_OPTIONS)[number]["value"];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "user", label: "Customers" },
  { value: "admin", label: "Admins" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;
type UserFilter = (typeof FILTERS)[number]["value"];

const CREATE_USER_FIELDS: FormFieldDef[] = [
  { key: "name", label: "Full name", type: "text", required: true, minLength: 2, maxLength: 100 },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "phone", label: "Phone (optional)", type: "tel" },
  { key: "password", label: "Password", type: "password", required: true, minLength: 6 },
  {
    key: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { label: "Customer", value: "user" },
      { label: "Admin", value: "admin" },
    ],
  },
];

function RoleBadge({ role }: { role: "admin" | "user" }) {
  const isAdmin = role === "admin";
  return (
    <span
      className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: isAdmin ? "#e3edfb" : "#eeeeec", color: isAdmin ? "#2f6fd6" : "#666" }}
    >
      {isAdmin ? "Admin" : "Customer"}
    </span>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<UserSortValue>("newest");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => setPage(1), [search, sort, filter]);

  const query: Record<string, unknown> = { search, page, limit: pageSize, sort };
  if (filter === "user" || filter === "admin") query.role = filter;
  if (filter === "active") query.isBlocked = false;
  if (filter === "inactive") query.isBlocked = true;

  const { data, isLoading, isError, refetch } = useAdminUsers(query);
  const { mutateAsync: createUser } = useCreateAdminUser();
  const { mutateAsync: toggleStatus } = useToggleUserStatus();
  const [statusTarget, setStatusTarget] = useState<AdminUserListItem | null>(null);
  const users = data?.data ?? [];

  const columns: AdminTableColumn<AdminUserListItem>[] = [
    {
      key: "customer",
      header: "Name",
      width: 220,
      render: (u) => (
        <div className="min-w-0">
          <TruncatedText text={u.name} className="text-[13px] font-semibold" />
          <TruncatedText text={u.email} className="text-[11px] text-[#8a8a8e]" />
        </div>
      ),
    },
    { key: "role", header: "Role", width: 90, render: (u) => <RoleBadge role={u.role} /> },
    {
      key: "status",
      header: "Status",
      width: 110,
      render: (u) => <StatusBadge status={u.isBlocked ? "Inactive" : "Active"} onClick={() => setStatusTarget(u)} />,
    },
    { key: "phone", header: "Phone", width: 120, render: (u) => <TruncatedText text={u.phone} className="text-[12.5px]" /> },
    {
      key: "location",
      header: "Location",
      width: 150,
      render: (u) => <TruncatedText text={u.address ? `${u.address.city}, ${u.address.state}` : undefined} className="text-[12.5px] text-[#555]" />,
    },
    {
      key: "joined",
      header: "Joined",
      width: 110,
      cellClassName: "whitespace-nowrap",
      render: (u) => <span className="text-[12.5px] text-[#555]">{formatDate(u.createdAt)}</span>,
    },
    { key: "view", header: "", align: "right", width: 70, render: () => <span className="text-xs font-semibold text-[#8a8a8e]">View →</span> },
  ];

  const exportCsv = () => {
    downloadCsv(
      "artspace-users.csv",
      ["Name", "Email", "Role", "Status", "Phone", "City", "State", "Joined"],
      users.map((u) => [
        u.name,
        u.email,
        u.role,
        u.isBlocked ? "Inactive" : "Active",
        u.phone ?? "",
        u.address?.city ?? "",
        u.address?.state ?? "",
        formatDate(u.createdAt),
      ]),
    );
  };

  const handleCreate = async (values: Record<string, unknown>) => {
    await createUser({
      name: String(values.name ?? ""),
      email: String(values.email ?? ""),
      phone: values.phone ? String(values.phone) : undefined,
      password: String(values.password ?? ""),
      role: values.role === "admin" ? "admin" : "user",
    } satisfies CreateUserPayload);
    setCreating(false);
  };

  const handleConfirmStatus = async () => {
    if (!statusTarget) return;
    await toggleStatus({ userId: statusTarget.id, isBlocked: statusTarget.isBlocked });
    setStatusTarget(null);
  };

  return (
    <AdminPageShell
      title="Users"
      subtitle="Everyone with access - customers who've checked out, and admin/staff accounts"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by name, email or phone"
      sortOptions={[...USER_SORT_OPTIONS]}
      sortValue={sort}
      onSortChange={(v) => setSort(v as UserSortValue)}
    >
      <AdminListFilterRow
        filters={<FilterPills options={FILTERS} value={filter} onChange={setFilter} />}
        right={
          <div className="hidden w-40 om:block">
            <SearchableSelect options={[...USER_SORT_OPTIONS]} value={sort} onChange={(v) => setSort(v as UserSortValue)} searchable={false} placeholder="Sort" />
          </div>
        }
      />

      <AdminCard>
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <button style={{ ...whitePillButton, display: "inline-flex", alignItems: "center", gap: 8 }} onClick={exportCsv}>
            <Download size={14} /> Export CSV
          </button>
          <button style={{ ...blackPillButton, display: "inline-flex", alignItems: "center", gap: 8 }} onClick={() => setCreating(true)}>
            <Plus size={14} /> Create user
          </button>
        </div>

        <AdminErrorBoundary>
          <AdminTable
            columns={columns}
            rows={users}
            getRowKey={(u) => u.id}
            minWidth={870}
            onRowClick={(u) => setOpenUserId(u.id)}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            errorMessage="Users couldn't load."
            emptyMessage="No users found."
            renderMobileCard={(u) => (
              <div onClick={() => setOpenUserId(u.id)} className="rounded-2xl border border-[#f0f0ee] p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[13.5px] font-bold">{u.name}</div>
                    <div className="text-[12px] text-[#555]">{u.email}</div>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1.5">
                    <RoleBadge role={u.role} />
                    <StatusBadge status={u.isBlocked ? "Inactive" : "Active"} onClick={() => setStatusTarget(u)} />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-[#8a8a8e]">
                  <span>{u.phone ?? "—"}</span>
                  <span>Joined {formatDate(u.createdAt)}</span>
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

      {openUserId && <UserDetailModal userId={openUserId} onClose={() => setOpenUserId(null)} />}

      {creating && (
        <FormModal
          title="Create user"
          fields={CREATE_USER_FIELDS}
          initialValues={{ name: "", email: "", phone: "", password: "", role: "user" }}
          saveLabel="Create"
          onSave={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}

      {statusTarget && (
        <ConfirmModal
          title={statusTarget.isBlocked ? "Activate user?" : "Deactivate user?"}
          message={
            statusTarget.isBlocked
              ? `"${statusTarget.name}" will be able to sign in / check out again.`
              : `"${statusTarget.name}" won't be able to sign in${statusTarget.role === "admin" ? " to the admin panel" : ""} until you reactivate them.`
          }
          confirmLabel={statusTarget.isBlocked ? "Activate" : "Deactivate"}
          tone={statusTarget.isBlocked ? "default" : "danger"}
          onConfirm={handleConfirmStatus}
          onClose={() => setStatusTarget(null)}
        />
      )}
    </AdminPageShell>
  );
}
