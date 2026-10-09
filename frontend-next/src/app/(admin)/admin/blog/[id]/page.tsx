"use client";

import { use } from "react";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import BlogEditor from "@/modules/blog/components/BlogEditor";

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AdminPageShell title="Edit article" subtitle="Changes go live when you save a published article">
      <BlogEditor blogId={id} />
    </AdminPageShell>
  );
}
