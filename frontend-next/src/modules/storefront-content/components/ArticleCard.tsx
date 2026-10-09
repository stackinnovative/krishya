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
