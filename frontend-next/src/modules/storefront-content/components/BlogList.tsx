"use client";

import { useState } from "react";
import Link from "next/link";
import ArticleCard, { ArticleImage } from "./ArticleCard";
import { ARTICLES, ARTICLE_CATEGORIES } from "../constants/articles";

const PER_PAGE = 6;
type Filter = "All" | (typeof ARTICLE_CATEGORIES)[number];

/** Journal index: featured article (on "All", page 1), category pills, card grid and page numbers. */
export default function BlogList() {
  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(1);

  const featured = ARTICLES[0];
  const list = filter === "All" ? ARTICLES.slice(1) : ARTICLES.filter((a) => a.category === filter);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const pick = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const pillClass = (on: boolean) =>
    `h-[38px] rounded-full border px-4 text-[13.5px] font-semibold ${on ? "border-ka-green bg-ka-green text-ka-cream" : "border-ka-sage bg-transparent text-ka-green"}`;

  return (
    <>
      {featured && filter === "All" && current === 1 && (
        <Link
          href={`/blog/${featured.slug}`}
          className="mb-[clamp(32px,4vw,56px)] grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(20px,4vw,56px)] rounded-2xl bg-ka-sand p-[clamp(14px,1.6vw,20px)] text-left hover:bg-[#EAE0CF]"
        >
          <ArticleImage tone="#E8F0E4" />
          <span className="flex flex-col gap-3.5 p-[clamp(4px,1.6vw,24px)]">
            <span className="flex items-center gap-2.5">
              <span className="rounded-full bg-ka-gold px-2.5 py-[5px] text-[11px] font-bold uppercase tracking-[.14em] text-ka-on-gold">Featured</span>
              <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-ka-green">{featured.category}</span>
            </span>
            <span className="text-balance font-display text-[clamp(28px,3vw,42px)] font-medium leading-[1.1] text-ka-green">{featured.title}</span>
            <span className="text-[15.5px] leading-[1.65] text-ka-body">{featured.excerpt}</span>
            <span className="text-[13px] text-ka-muted">
              {featured.date} · {featured.readTime}
            </span>
          </span>
        </Link>
      )}

      <div className="mb-[clamp(24px,3vw,36px)] flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
        {(["All", ...ARTICLE_CATEGORIES] as Filter[]).map((c) => (
          <button key={c} type="button" onClick={() => pick(c)} aria-pressed={filter === c} className={pillClass(filter === c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[clamp(24px,2.8vw,36px)]">
        {visible.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === current ? "page" : undefined}
              className={`h-11 w-11 rounded-lg border text-sm font-semibold ${n === current ? "border-ka-green bg-ka-green text-ka-cream" : "border-ka-line bg-transparent text-ka-green"}`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
