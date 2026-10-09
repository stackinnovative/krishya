"use client";

import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import BlogEditor from "@/modules/blog/components/BlogEditor";

export default function NewBlogPage() {
  return (
    <AdminPageShell title="New article" subtitle="Saved as a draft until you publish it">
      <BlogEditor blogId={null} />
    </AdminPageShell>
  );
}
