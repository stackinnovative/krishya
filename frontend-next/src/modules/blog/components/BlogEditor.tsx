"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminAsyncState from "@/modules/admin-shell/components/AdminAsyncState";
import AdminButton from "@/modules/admin-shell/components/AdminButton";
import FormField from "@/modules/admin-shell/components/FormField";
import Skeleton from "@/modules/admin-shell/components/Skeleton";
import StatusBadge from "@/modules/admin-shell/components/StatusBadge";
import Toggle from "@/modules/admin-shell/components/Toggle";
import { isPendingImage, type ImageFieldValue } from "@/modules/admin-shell/components/ImageDropzone";
import { whitePillButton } from "@/modules/admin-shell/style-helpers";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getApiErrorMessage, getApiFieldErrors, getApiStatus } from "@/lib/errors";
import { scrollToFirstError } from "@/shared/scrollToFirstError";
import { useActiveProductOptions } from "@/modules/products/hooks/useStorefrontProducts";
import { useAdminBlog, useSaveBlog } from "../hooks/useAdminBlogs";
import { BLOG_CATEGORIES, BLOG_COVER_RATIO, BLOG_LIMITS as L } from "../constants";
import { emptyDraft, newBlock, toDraft, toFieldErrors, toPayload, toSlug, validateBlog, type BlogDraft, type BlogErrors, type DraftBlock } from "../blog-form";
import type { BlogBlockType, BlogImage, BlogStatus } from "../types/blog.type";
import BlockEditor, { BLOCK_META } from "./BlockEditor";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <AdminCard padding="22px">
      <div className="mb-1 text-sm font-bold">{title}</div>
      {description && <div className="mb-4 text-xs leading-relaxed text-[#8a8a8e]">{description}</div>}
      <div className={`flex flex-col gap-3 ${description ? "" : "mt-3"}`}>{children}</div>
    </AdminCard>
  );
}

function EditorSkeleton() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 om:grid-cols-[minmax(0,1fr)_340px]">
      {[0, 1].map((col) => (
        <div key={col} className="flex flex-col gap-4">
          {[0, 1].map((card) => (
            <AdminCard key={card} padding="22px">
              <Skeleton className="mb-4 h-4 w-32" />
              <Skeleton className="mb-3 h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </AdminCard>
          ))}
        </div>
      ))}
    </div>
  );
}

const BLOCK_TYPES = Object.keys(BLOCK_META) as BlogBlockType[];

/**
 * Full-page article editor (Blog -> New article / Edit). The body is built
 * from blocks the admin adds and orders; photos are cropped locally and
 * uploaded only on save. "Save draft" keeps it off the store, "Publish"
 * makes it live (or schedules it, with a future publish date).
 */
export default function BlogEditor({ blogId }: { blogId: string | null }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useAdminBlog(blogId);
  const { data: productOptions = [] } = useActiveProductOptions();
  const saveBlog = useSaveBlog();
  const original = blogId ? (data?.data ?? null) : null;

  const [draft, setDraft] = useState<BlogDraft | null>(blogId ? null : emptyDraft);
  const [errors, setErrors] = useState<BlogErrors>({});
  const [uploading, setUploading] = useState(false);
  const [savingAs, setSavingAs] = useState<BlogStatus | null>(null);

  useEffect(() => {
    if (original) setDraft(toDraft(original));
  }, [original]);

  const productNames = useMemo(() => Object.fromEntries((original?.products ?? []).map((p) => [p.id, p.name])), [original]);

  /** Updates top-level fields and clears their errors. */
  const set = (values: Partial<BlogDraft>) => {
    setDraft((d) => (d ? { ...d, ...values } : d));
    setErrors((prev) => {
      const touched = Object.keys(values);
      const next = Object.fromEntries(Object.entries(prev).filter(([key]) => !touched.includes(key)));
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  };

  /** Replaces the block list. A reorder/add/remove shifts indexes, so every block error is cleared; an edit clears only that block's. */
  const setBlocks = (blocks: DraftBlock[], changedIndex?: number) => {
    setDraft((d) => (d ? { ...d, blocks } : d));
    setErrors((prev) => {
      const prefix = changedIndex === undefined ? "blocks" : `blocks.${changedIndex}.`;
      return Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(prefix)));
    });
  };

  const handleSave = async (status: BlogStatus) => {
    if (!draft) return;
    const found = validateBlog(draft, status);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      toast.error("Fix the highlighted fields.");
      scrollToFirstError();
      return;
    }

    setSavingAs(status);
    // Upload only the photos that were newly cropped in this session.
    const upload = async (value: ImageFieldValue | null, name: string): Promise<BlogImage | null> => {
      if (!isPendingImage(value)) return value;
      return uploadToCloudinary(new File([value.blob], `blog-${name}.jpg`, { type: value.blob.type || "image/jpeg" }));
    };
    const images = new Map<string, BlogImage | null>();
    setUploading(true);
    try {
      const jobs = [
        upload(draft.coverImage, "cover").then((img) => images.set("cover", img)),
        ...draft.blocks.flatMap((b) => (b.type === "image" ? [upload(b.image, b.key).then((img) => images.set(b.key, img))] : [])),
      ];
      await Promise.all(jobs);
    } catch {
      toast.error("A photo could not be uploaded. Check your connection and try again.");
      setSavingAs(null);
      return;
    } finally {
      setUploading(false);
    }

    try {
      const res = await saveBlog.mutateAsync({ id: blogId, data: toPayload(draft, status, images, original) });
      setErrors({});
      if (!blogId && res.data) router.replace(`/admin/blog/${res.data.id}`);
      else if (res.data) setDraft(toDraft(res.data));
    } catch (err) {
      const apiErrors = getApiFieldErrors(err);
      if (apiErrors) setErrors(toFieldErrors(apiErrors));
      else if (getApiStatus(err) === 409) setErrors({ slug: getApiErrorMessage(err, "Another article already uses this URL.") });
      if (apiErrors || getApiStatus(err) === 409) scrollToFirstError();
    } finally {
      setSavingAs(null);
    }
  };

  const busy = uploading || saveBlog.isPending;
  const isLive = original?.status === "published";
  const isScheduled = isLive && !!original?.publishedAt && new Date(original.publishedAt).getTime() > Date.now();
  const statusLabel = !original ? "New" : isScheduled ? "Scheduled" : isLive ? "Published" : "Draft";

  return (
    <AdminAsyncState
      isLoading={!!blogId && (isLoading || (!isError && !draft))}
      isError={isError}
      onRetry={refetch}
      skeleton={<EditorSkeleton />}
      errorTitle="Article unavailable"
    >
      {draft && (
        <>
          <div className="grid grid-cols-1 items-start gap-4 om:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-4">
              <Section title="Article">
                <FormField
                  label="Title"
                  value={draft.title}
                  onChange={(v) => set({ title: v as string })}
                  placeholder="e.g. Karkidakam: Preparing for the Monsoon, the Kerala Way"
                  maxLength={L.title}
                  required
                  error={errors.title}
                />
                <FormField
                  label="Summary"
                  type="area"
                  rows={3}
                  value={draft.excerpt}
                  onChange={(v) => set({ excerpt: v as string })}
                  placeholder="One or two sentences shown on the article card and at the top of the article."
                  maxLength={L.excerpt}
                  required
                  error={errors.excerpt}
                  hint={`${L.excerptMin}-${L.excerpt} characters.`}
                />
              </Section>

              <Section title="Content" description="Build the article from blocks, top to bottom. Use the arrows to reorder.">
                <div className="flex flex-col gap-3" data-invalid={errors.blocks ? "true" : undefined}>
                  {draft.blocks.map((block, i) => (
                    <BlockEditor
                      key={block.key}
                      block={block}
                      index={i}
                      count={draft.blocks.length}
                      errors={errors}
                      productOptions={productOptions}
                      productNames={productNames}
                      onChange={(next) => setBlocks(draft.blocks.map((b, j) => (j === i ? next : b)), i)}
                      onMove={(step) => {
                        const next = [...draft.blocks];
                        [next[i + step], next[i]] = [next[i]!, next[i + step]!];
                        setBlocks(next);
                      }}
                      onRemove={() => setBlocks(draft.blocks.filter((b) => b.key !== block.key))}
                    />
                  ))}
                  {errors.blocks && <span className="text-[11px] font-medium text-[#d6432f]">{errors.blocks}</span>}
                </div>

                <div className="rounded-2xl border border-dashed border-[#dcdcd8] p-3">
                  <div className="mb-2 text-[11.5px] font-semibold text-[#8a8a8e]">
                    Add a block <span className="font-normal">· {draft.blocks.length}/{L.blocksMax}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {BLOCK_TYPES.map((type) => {
                      const { label, icon: Icon, hint } = BLOCK_META[type];
                      return (
                        <button
                          key={type}
                          type="button"
                          title={hint}
                          disabled={draft.blocks.length >= L.blocksMax}
                          onClick={() => setBlocks([...draft.blocks, newBlock(type)])}
                          style={{ ...whitePillButton, display: "inline-flex", alignItems: "center", gap: 6 }}
                          className="disabled:opacity-40"
                        >
                          <Icon size={13} /> {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Section>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <Section title="Publishing">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-semibold">Status</span>
                  <StatusBadge status={statusLabel} />
                </div>
                <FormField
                  label="Publish date"
                  type="date"
                  value={draft.publishDate}
                  onChange={(v) => set({ publishDate: v as string })}
                  error={errors.publishedAt}
                  hint="Optional. Leave empty to use the day you publish. A future date keeps the article hidden until then."
                />
                <div
                  onClick={() => set({ isFeatured: !draft.isFeatured })}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-[#fafaf8] px-3.5 py-3"
                >
                  <div>
                    <div className="text-[12.5px] font-semibold">Featured</div>
                    <div className="text-[11px] text-[#8a8a8e]">The big card at the top of the Blog page. Only one article is featured at a time.</div>
                  </div>
                  <Toggle on={draft.isFeatured} onClick={() => set({ isFeatured: !draft.isFeatured })} />
                </div>
              </Section>

              <Section title="Category & cover">
                <FormField
                  label="Category"
                  type="select"
                  value={draft.category}
                  onChange={(v) => set({ category: v as BlogDraft["category"] })}
                  options={[...BLOG_CATEGORIES]}
                  placeholder="Choose a category"
                  required
                  error={errors.category}
                />
                <FormField
                  label="Cover photo"
                  type="image"
                  value={draft.coverImage}
                  onChange={(v) => set({ coverImage: v as ImageFieldValue | null })}
                  imageAspectRatio={BLOG_COVER_RATIO}
                  imageMaxHeight={180}
                  error={errors.coverImage}
                  hint="Landscape (3:2). Needed to publish - drafts can be saved without it."
                />
              </Section>

              <Section title="URL & search engines">
                <FormField
                  label="URL"
                  value={draft.slug}
                  onChange={(v) => set({ slug: v as string })}
                  placeholder={toSlug(draft.title) || "made-from-the-title"}
                  maxLength={L.slug}
                  error={errors.slug}
                  hint={`/blog/${toSlug(draft.slug) || toSlug(draft.title) || "…"} - leave empty to make it from the title.`}
                />
                <FormField
                  label="SEO title"
                  value={draft.seoTitle}
                  onChange={(v) => set({ seoTitle: v as string })}
                  placeholder={draft.title || "Defaults to the article title"}
                  maxLength={L.seoTitle}
                  error={errors.seoTitle}
                  hint="Optional. The title shown in Google results."
                />
                <FormField
                  label="SEO description"
                  type="area"
                  rows={3}
                  value={draft.seoDescription}
                  onChange={(v) => set({ seoDescription: v as string })}
                  placeholder={draft.excerpt || "Defaults to the summary"}
                  maxLength={L.seoDescription}
                  error={errors.seoDescription}
                  hint="Optional. The text under the title in Google results."
                />
              </Section>
            </div>
          </div>

          {/* Sticky so Save is always reachable on a long article, as on the About editor. */}
          <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#e6e6e3] bg-[#f1f1ef] px-4 py-3 om:-mx-8 om:px-8">
            <div className="mr-auto flex flex-wrap items-center gap-4">
              <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#555] hover:text-[#141414]">
                <ArrowLeft size={13} /> All articles
              </Link>
              {isLive && original && !isScheduled && (
                <Link
                  href={`/blog/${original.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#555] hover:text-[#141414]"
                >
                  View on store <ExternalLink size={13} />
                </Link>
              )}
            </div>
            <button type="button" style={whitePillButton} disabled={busy} className="disabled:opacity-50" onClick={() => handleSave("draft")}>
              {savingAs === "draft" ? (uploading ? "Uploading photos…" : "Saving…") : isLive ? "Move to drafts" : "Save draft"}
            </button>
            <AdminButton loading={savingAs === "published"} loadingText={uploading ? "Uploading photos…" : "Saving…"} disabled={busy} onClick={() => handleSave("published")}>
              {isLive ? "Save changes" : "Publish"}
            </AdminButton>
          </div>
        </>
      )}
    </AdminAsyncState>
  );
}
