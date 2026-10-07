import Link from "next/link";
import { LeafIcon } from "@/modules/storefront-shell/components/icons";
import type { Article } from "../constants/articles";

/** Tinted, finely striped image panel for an article (the journal has no photography yet). */
export function ArticleImage({ tone, className = "aspect-[3/2]" }: { tone: string; className?: string }) {
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

/** Journal card: image panel, category pill, serif title and date / read time. */
export default function ArticleCard({ article, showDate = true, pill = true }: { article: Article; showDate?: boolean; pill?: boolean }) {
  return (
    <Link href={`/blog/${article.slug}`} className="flex flex-col gap-3 text-left transition-opacity hover:opacity-[.88] sm:gap-3.5">
      <ArticleImage tone={article.tone} />
      <span
        className={`self-start text-[11px] font-semibold uppercase tracking-[.14em] text-ka-green ${pill ? "rounded-full bg-ka-mint px-2.5 py-[5px]" : ""}`}
      >
        {article.category}
      </span>
      <span className="text-balance font-display text-[25px] font-semibold leading-[1.15] text-ka-green">{article.title}</span>
      <span className="text-[13px] text-ka-muted">{showDate ? `${article.date} · ${article.readTime}` : article.readTime}</span>
    </Link>
  );
}
