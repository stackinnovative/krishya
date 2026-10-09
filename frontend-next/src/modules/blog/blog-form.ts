import type { ImageFieldValue } from "@/modules/admin-shell/components/ImageDropzone";
import { BLOG_LIMITS as L } from "./constants";
import type { AdminBlog, BlogBlockType, BlogCategory, BlogImage, BlogStatus, SaveBlogPayload } from "./types/blog.type";

/** A body block being edited. `key` is local only - it keeps each card (and its photo preview) attached to the right block while reordering. */
export type DraftBlock = { key: string } & (
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; image: ImageFieldValue | null; caption: string }
  | { type: "products"; productIds: string[] }
);

/** Editor working copy. Photos may still be cropped-not-yet-uploaded `PendingImage`s (uploaded only on save). */
export type BlogDraft = {
  title: string;
  slug: string;
  category: BlogCategory | "";
  excerpt: string;
  coverImage: ImageFieldValue | null;
  blocks: DraftBlock[];
  isFeatured: boolean;
  /** "YYYY-MM-DD" from the date input, or "" for "when it goes live". */
  publishDate: string;
  seoTitle: string;
  seoDescription: string;
};

let blockKey = 0;
const nextKey = () => `block-${++blockKey}`;

export const newBlock = (type: BlogBlockType): DraftBlock => {
  const key = nextKey();
  switch (type) {
    case "list":
      return { key, type, items: [""] };
    case "image":
      return { key, type, image: null, caption: "" };
    case "products":
      return { key, type, productIds: [] };
    default:
      return { key, type, text: "" };
  }
};

/** Same rule as the backend's toSlug - used to preview the URL while the field is empty. */
export const toSlug = (text: string): string =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, L.slug)
    .replace(/-+$/, "");

/** Local calendar day of an ISO date, as the date input wants it. */
const toDateInput = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const emptyDraft = (): BlogDraft => ({
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  coverImage: null,
  blocks: [newBlock("paragraph")],
  isFeatured: false,
  publishDate: "",
  seoTitle: "",
  seoDescription: "",
});

export const toDraft = (blog: AdminBlog): BlogDraft => ({
  title: blog.title,
  slug: blog.slug,
  category: blog.category,
  excerpt: blog.excerpt,
  coverImage: blog.coverImage,
  blocks: blog.blocks.map((b) => ({ ...b, key: nextKey() }) as DraftBlock),
  isFeatured: blog.isFeatured,
  publishDate: toDateInput(blog.publishedAt),
  seoTitle: blog.seoTitle,
  seoDescription: blog.seoDescription,
});

/** Error keys use the backend's dotted paths ("blocks.2.text", "blocks.3.items.1"), so server and client errors land in the same place. */
export type BlogErrors = Record<string, string>;

const len = (s: string) => s.trim().length;

/** Same rules as CreateBlogSchema in the backend DTO, plus "a cover photo before publishing". */
export const validateBlog = (d: BlogDraft, status: BlogStatus): BlogErrors => {
  const e: BlogErrors = {};
  const text = (key: string, value: string, max: number, label: string, required = true) => {
    if (required && !len(value)) e[key] = `${label} is required.`;
    else if (len(value) > max) e[key] = `${label} cannot exceed ${max} characters.`;
  };

  text("title", d.title, L.title, "Title");
  if (d.slug.trim() && !toSlug(d.slug)) e.slug = "Use letters or numbers in the URL.";
  if (!d.category) e.category = "Choose a category.";
  if (len(d.excerpt) < L.excerptMin) e.excerpt = `Summary needs at least ${L.excerptMin} characters.`;
  else text("excerpt", d.excerpt, L.excerpt, "Summary");
  if (status === "published" && !d.coverImage) e.coverImage = "Add a cover photo before publishing.";
  text("seoTitle", d.seoTitle, L.seoTitle, "SEO title", false);
  text("seoDescription", d.seoDescription, L.seoDescription, "SEO description", false);

  if (d.blocks.length < L.blocksMin) e.blocks = "Add at least one content block.";
  if (d.blocks.length > L.blocksMax) e.blocks = `An article can have at most ${L.blocksMax} blocks.`;
  d.blocks.forEach((b, i) => {
    const at = `blocks.${i}`;
    if (b.type === "paragraph") text(`${at}.text`, b.text, L.paragraph, "Paragraph");
    if (b.type === "heading") text(`${at}.text`, b.text, L.heading, "Heading");
    if (b.type === "quote") text(`${at}.text`, b.text, L.quote, "Quote");
    if (b.type === "list") {
      if (!b.items.some((item) => len(item))) e[`${at}.items`] = "Add at least one list item.";
      b.items.forEach((item, j) => len(item) > L.listItem && (e[`${at}.items.${j}`] = `List item cannot exceed ${L.listItem} characters.`));
    }
    if (b.type === "image") {
      if (!b.image) e[`${at}.image`] = "Add a photo, or remove this block.";
      text(`${at}.caption`, b.caption, L.caption, "Caption", false);
    }
    if (b.type === "products" && b.productIds.length === 0) e[`${at}.productIds`] = "Pick at least one product, or remove this block.";
  });

  return e;
};

/** Server paths like "coverImage.url" or "blocks.2.productIds.0" belong to the field above them. */
export const toFieldErrors = (apiErrors: Record<string, string>): BlogErrors =>
  Object.fromEntries(
    Object.entries(apiErrors).map(([path, message]) => [path.replace(/\.(url|publicId)$/, "").replace(/(\.productIds)\.\d+$/, "$1"), message]),
  );

const t = (s: string) => s.trim();

/**
 * Trimmed payload once every photo is uploaded. `images` maps a block key
 * (and "cover") to its uploaded photo. The publish date keeps its original
 * time when the admin didn't change the day, so re-saving never reorders articles.
 */
export const toPayload = (
  d: BlogDraft,
  status: BlogStatus,
  images: Map<string, BlogImage | null>,
  original: AdminBlog | null,
): SaveBlogPayload => {
  const sameDay = original?.publishedAt && toDateInput(original.publishedAt) === d.publishDate;
  const publishedAt = !d.publishDate ? null : sameDay ? original.publishedAt : new Date(`${d.publishDate}T00:00:00`).toISOString();

  return {
    title: t(d.title),
    slug: t(d.slug),
    category: d.category as BlogCategory,
    excerpt: t(d.excerpt),
    coverImage: images.get("cover") ?? null,
    blocks: d.blocks.map((b) => {
      switch (b.type) {
        case "list":
          return { type: "list", items: b.items.map(t).filter(Boolean) };
        case "image":
          return { type: "image", image: images.get(b.key)!, caption: t(b.caption) };
        case "products":
          return { type: "products", productIds: b.productIds };
        default:
          return { type: b.type, text: t(b.text) };
      }
    }),
    isFeatured: d.isFeatured,
    status,
    publishedAt,
    seoTitle: t(d.seoTitle),
    seoDescription: t(d.seoDescription),
  };
};
