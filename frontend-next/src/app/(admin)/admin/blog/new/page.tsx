"use client";

import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import BlogEditor from "@/modules/blog/components/BlogEditor";

export default function NewBlogPage() {
  return (
    <AdminPageShell title="New article" subtitle="Saved as a draft until you publish it" breadcrumbs={[{ label: "Blog", href: "/admin/blog" }, { label: "New article" }]}>
      <BlogEditor blogId={null} />
    </AdminPageShell>
  );
}
