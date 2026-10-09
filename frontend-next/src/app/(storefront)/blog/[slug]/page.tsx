import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreInfo } from "@/modules/settings/server";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { SectionDecor, Wave } from "@/modules/storefront-shell/components/decor";
import ArticleCard, { ArticleCover, articleMeta } from "@/modules/storefront-content/components/ArticleCard";
import ArticleBody from "@/modules/storefront-content/components/ArticleBody";
import { ArticleShare } from "@/modules/storefront-content/components/ArticleExtras";
import { getBlogBySlug } from "@/modules/blog/server";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogBySlug(slug);
  if (!article) return { title: "Article not found" };

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}),
      ...(article.coverImage ? { images: [{ url: getOptimizedImageUrl(article.coverImage.url, 1200, 630), width: 1200, height: 630 }] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getBlogBySlug(slug);
  if (!article) notFound();
  const { storeName } = await getStoreInfo();

  return (
    <>
      <article className="pb-[clamp(48px,6vw,88px)] pt-[clamp(36px,4.4vw,64px)]">
        <header className="mx-auto flex max-w-[780px] flex-col gap-4 px-[clamp(20px,4vw,56px)]">
          <Link href="/blog" className="self-start text-[13.5px] text-ka-muted hover:text-ka-green">
            ← All articles
          </Link>
          <span className="self-start rounded-full bg-ka-mint px-2.5 py-[5px] text-[11px] font-semibold uppercase tracking-[.14em] text-ka-green">{article.category}</span>
          <h1 className="m-0 text-balance break-words font-display text-[clamp(38px,4.6vw,62px)] font-medium leading-[1.06] text-ka-green">{article.title}</h1>
          <span className="text-sm text-ka-muted">
            {articleMeta(article)} · By the {storeName} team
          </span>
        </header>

        <div className="mx-auto my-[clamp(28px,3.6vw,48px)] max-w-[1100px] px-[clamp(20px,4vw,56px)]">
          <ArticleCover image={article.coverImage} alt={article.title} priority sizes="(max-width: 1100px) 100vw, 1000px" className="aspect-[16/8]" />
        </div>

        <div className="mx-auto flex max-w-[700px] flex-col gap-[22px] px-[clamp(20px,4vw,56px)] text-[17.5px] leading-[1.85] text-ka-ink">
          <p className="m-0 text-pretty break-words text-[19.5px] leading-[1.7] text-ka-green">{article.excerpt}</p>
          <ArticleBody blocks={article.blocks} />
          <ArticleShare title={article.title} />
        </div>
      </article>

      {/* Always a mint strip - the footer's wave starts from mint on article pages. */}
      <Wave from="#FAF6EE" to="#E8F0E4" shape="b" />
      <section className="relative isolate overflow-clip bg-ka-mint py-[clamp(48px,6vw,88px)]">
        <SectionDecor variant="d" />
        <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,56px)]">
          {article.related.length > 0 ? (
            <>
              <h2 className="m-0 mb-[clamp(24px,3vw,40px)] font-display text-[clamp(30px,3.2vw,44px)] font-medium text-ka-green">Related articles</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[clamp(20px,2.4vw,32px)]">
                {article.related.map((a) => (
                  <ArticleCard key={a.id} article={a} showDate={false} pill={false} tone="#FAF6EE" />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="m-0 font-display text-[clamp(30px,3.2vw,44px)] font-medium text-ka-green">Bring Kerala Ayurveda home</h2>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/products" className="flex h-12 items-center rounded-lg bg-ka-green px-7 text-[15px] font-semibold text-ka-cream hover:bg-ka-green-dark">
                  Shop the Collection
                </Link>
                <Link href="/blog" className="flex h-12 items-center rounded-lg border border-ka-green px-7 text-[15px] font-semibold text-ka-green hover:bg-ka-cream">
                  Back to the Journal
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
