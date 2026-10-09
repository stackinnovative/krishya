"use client";

import { use } from "react";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import BlogEditor from "@/modules/blog/components/BlogEditor";
import { useAdminBlog } from "@/modules/blog/hooks/useAdminBlogs";

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // Same query the editor runs, so this adds no extra request - it just names the article in the trail.
  const { data } = useAdminBlog(id);

  return (
    <AdminPageShell
      title="Edit article"
      subtitle="Changes go live when you save a published article"
      breadcrumbs={[{ label: "Blog", href: "/admin/blog" }, { label: data?.data?.title ?? "Edit article" }]}
    >
      <BlogEditor blogId={id} />
    </AdminPageShell>
  );
}
