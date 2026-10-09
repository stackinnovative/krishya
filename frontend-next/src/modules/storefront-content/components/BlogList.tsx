"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ArticleCard, { ArticleCover, articleMeta } from "./ArticleCard";
import { LeafIcon } from "@/modules/storefront-shell/components/icons";
import { useBlogList, useFeaturedBlog } from "@/modules/blog/hooks/useStorefrontBlogs";
import { BLOG_CATEGORIES, blogListQuery } from "@/modules/blog/constants";

type Filter = "All" | (typeof BLOG_CATEGORIES)[number];

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[clamp(24px,2.8vw,36px)]";

function CardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3.5" aria-hidden="true">
      <span className="aspect-[3/2] w-full rounded-xl bg-ka-sand" />
      <span className="h-5 w-28 rounded-full bg-ka-sand" />
      <span className="h-7 w-11/12 rounded bg-ka-sand" />
      <span className="h-4 w-32 rounded bg-ka-sand" />
    </div>
  );
}

function Notice({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-ka-sand px-6 py-[clamp(40px,6vw,72px)] text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-ka-cream text-ka-green">
        <LeafIcon size={26} strokeWidth={1.4} />
      </span>
      <span className="font-display text-[clamp(24px,2.6vw,32px)] font-medium text-ka-green">{title}</span>
      <span className="max-w-[440px] text-[15px] leading-[1.6] text-ka-body">{body}</span>
      {action}
    </div>
  );
}

const ACTION_CLASS = "mt-2 flex h-11 items-center rounded-lg bg-ka-green px-6 text-[14px] font-semibold text-ka-cream hover:bg-ka-green-dark";

/** Journal index: featured article (on "All", page 1), topic pills, card grid and page numbers. */
export default function BlogList() {
  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const featuredQuery = useFeaturedBlog();
  const featured = featuredQuery.data?.data ?? null;
  const showFeatured = filter === "All" && page === 1 && !!featured;

  // On "All" the featured article is shown above the grid, so it's left out of the list itself.
  const query = blogListQuery({ page, category: filter === "All" ? undefined : filter, excludeId: filter === "All" ? featured?.id : undefined });
  const listQuery = useBlogList(query, !featuredQuery.isPending);
  const articles = listQuery.data?.data ?? [];
  const pages = Math.max(1, listQuery.data?.totalPages ?? 1);
  const loading = featuredQuery.isPending || (listQuery.isPending && !listQuery.data);

  const pick = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const goTo = (n: number) => {
    setPage(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pillClass = (on: boolean) =>
    `h-[38px] rounded-full border px-4 text-[13.5px] font-semibold ${on ? "border-ka-green bg-ka-green text-ka-cream" : "border-ka-sage bg-transparent text-ka-green"}`;

  if (!loading && !listQuery.isError && filter === "All" && !featured && articles.length === 0) {
    return (
      <Notice
        title="Articles are on their way"
        body="We're writing about seasonal care, daily routines and the herbs of Kerala. Check back soon."
        action={
          <Link href="/products" className={ACTION_CLASS}>
            Explore the range
          </Link>
        }
      />
    );
  }

  return (
    <>
      {showFeatured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="mb-[clamp(32px,4vw,56px)] grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(20px,4vw,56px)] rounded-2xl bg-ka-sand p-[clamp(14px,1.6vw,20px)] text-left transition-opacity hover:opacity-[.92]"
        >
          <ArticleCover image={featured.coverImage} alt="" priority sizes="(max-width: 900px) 100vw, 620px" />
          <span className="flex min-w-0 flex-col gap-3.5 p-[clamp(4px,1.6vw,24px)]">
            <span className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-ka-gold px-2.5 py-[5px] text-[11px] font-bold uppercase tracking-[.14em] text-ka-on-gold">Featured</span>
              <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-ka-green">{featured.category}</span>
            </span>
            <span className="text-balance break-words font-display text-[clamp(28px,3vw,42px)] font-medium leading-[1.1] text-ka-green">{featured.title}</span>
            <span className="break-words text-[15.5px] leading-[1.65] text-ka-body">{featured.excerpt}</span>
            <span className="text-[13px] text-ka-muted">{articleMeta(featured)}</span>
          </span>
        </Link>
      )}

      <div ref={topRef} className="mb-[clamp(24px,3vw,36px)] flex scroll-mt-28 flex-wrap gap-2" role="group" aria-label="Filter by topic">
        {(["All", ...BLOG_CATEGORIES] as Filter[]).map((c) => (
          <button key={c} type="button" onClick={() => pick(c)} aria-pressed={filter === c} className={pillClass(filter === c)}>
            {c}
          </button>
        ))}
      </div>

      {listQuery.isError ? (
        <Notice
          title="Couldn't load articles"
          body="Check your connection and try again."
          action={
            <button type="button" onClick={() => listQuery.refetch()} className={ACTION_CLASS}>
              Try again
            </button>
          }
        />
      ) : loading ? (
        <div className={GRID}>
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        filter !== "All" && (
          <Notice
            title={`Nothing in ${filter} yet`}
            body="New articles are added regularly - meanwhile, browse the rest of the Journal."
            action={
              <button type="button" onClick={() => pick("All")} className={ACTION_CLASS}>
                See all articles
              </button>
            }
          />
        )
      ) : (
        <div className={`${GRID} transition-opacity ${listQuery.isPlaceholderData ? "opacity-60" : ""}`}>
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {pages > 1 && !listQuery.isError && (
        <nav aria-label="Pagination" className="mt-12 flex flex-wrap justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => goTo(n)}
              aria-current={n === page ? "page" : undefined}
              className={`h-11 w-11 rounded-lg border text-sm font-semibold ${n === page ? "border-ka-green bg-ka-green text-ka-cream" : "border-ka-line bg-transparent text-ka-green"}`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
