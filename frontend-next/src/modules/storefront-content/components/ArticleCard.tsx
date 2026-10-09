import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { formatDate } from "@/lib/format";
import { LeafIcon } from "@/modules/storefront-shell/components/icons";
import type { BlogImage, BlogListItem } from "@/modules/blog/types/blog.type";

/** Tinted, finely striped panel - stands in for a missing photo. */
export function ArticleImage({ tone = "#E8F0E4", className = "aspect-[3/2]" }: { tone?: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid w-full place-items-center rounded-xl text-ka-green/25 ${className}`}
      style={{ backgroundColor: tone, backgroundImage: "repeating-linear-gradient(135deg,rgba(31,77,58,.05) 0 1px,transparent 1px 11px)" }}
    >
      <LeafIcon size={44} strokeWidth={1} />
    </span>
  );
}

/** An article's cover photo in a rounded 3:2 frame, or the striped panel when it has none. */
export function ArticleCover({
  image,
  alt,
  sizes,
  tone,
  priority = false,
  className = "aspect-[3/2]",
}: {
  image: BlogImage | null;
  alt: string;
  sizes: string;
  tone?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!image) return <ArticleImage tone={tone} className={className} />;
  return (
    <span className={`relative block w-full overflow-hidden rounded-xl bg-ka-sand ${className}`}>
      <Image src={getOptimizedImageUrl(image.url, 900, 600)} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </span>
  );
}

/** "12 Sep 2026 · 6 min read" (or just the read time). */
export const articleMeta = (article: BlogListItem, showDate = true) => {
  const read = `${article.readMinutes} min read`;
  return showDate && article.publishedAt ? `${formatDate(article.publishedAt)} · ${read}` : read;
};

/**
 * Side-by-side card for a lone article (e.g. the home row before a second one
 * is published) - a full-width stacked card would blow its photo up to the
 * whole container. Stacks like a normal card on small screens.
 */
export function ArticleRow({ article }: { article: BlogListItem }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group grid items-center gap-[clamp(18px,3vw,44px)] rounded-2xl bg-ka-sand p-[clamp(12px,1.4vw,18px)] text-left transition-opacity hover:opacity-[.92] sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] ka:grid-cols-[minmax(0,440px)_minmax(0,1fr)]"
    >
      <ArticleCover image={article.coverImage} alt="" sizes="(max-width: 640px) 100vw, 440px" />
      <span className="flex min-w-0 flex-col gap-3 px-1 pb-2 sm:p-[clamp(4px,1.2vw,16px)]">
        <span className="self-start rounded-full bg-ka-cream px-2.5 py-[5px] text-[11px] font-semibold uppercase tracking-[.14em] text-ka-green">{article.category}</span>
        <span className="text-balance break-words font-display text-[clamp(25px,2.4vw,34px)] font-medium leading-[1.12] text-ka-green">{article.title}</span>
        <span className="line-clamp-3 break-words text-[15px] leading-[1.65] text-ka-body">{article.excerpt}</span>
        <span className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] text-ka-muted">{articleMeta(article)}</span>
          <span className="text-[14px] font-semibold text-ka-green underline-offset-4 group-hover:underline">Read article →</span>
        </span>
      </span>
    </Link>
  );
}

/** Journal card: cover photo, category pill, serif title and date / read time. */
export default function ArticleCard({
  article,
  showDate = true,
  pill = true,
  tone,
}: {
  article: BlogListItem;
  showDate?: boolean;
  pill?: boolean;
  /** Placeholder tint when the article has no cover photo. */
  tone?: string;
}) {
  return (
    <Link href={`/blog/${article.slug}`} className="flex min-w-0 flex-col gap-3 text-left transition-opacity hover:opacity-[.88] sm:gap-3.5">
      <ArticleCover image={article.coverImage} alt="" tone={tone} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 400px" />
      <span
        className={`self-start text-[11px] font-semibold uppercase tracking-[.14em] text-ka-green ${pill ? "rounded-full bg-ka-mint px-2.5 py-[5px]" : ""}`}
      >
        {article.category}
      </span>
      <span className="text-balance break-words font-display text-[25px] font-semibold leading-[1.15] text-ka-green">{article.title}</span>
      <span className="text-[13px] text-ka-muted">{articleMeta(article, showDate)}</span>
    </Link>
  );
}
