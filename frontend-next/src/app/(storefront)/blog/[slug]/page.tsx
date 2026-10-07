import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreInfo } from "@/modules/settings/server";
import { SectionDecor, Wave } from "@/modules/storefront-shell/components/decor";
import ArticleCard, { ArticleImage } from "@/modules/storefront-content/components/ArticleCard";
import { ArticleProducts, ArticleShare } from "@/modules/storefront-content/components/ArticleExtras";
import { ARTICLES, getArticleBySlug, getRelatedArticles } from "@/modules/storefront-content/constants/articles";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.excerpt, openGraph: { title: article.title, description: article.excerpt, type: "article" } };
}

const H2 = "mb-0 mt-3.5 font-display text-[32px] font-semibold leading-[1.15] text-ka-green";

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const related = getRelatedArticles(article);
  const { storeName } = await getStoreInfo();

  return (
    <>
      <article className="pb-[clamp(48px,6vw,88px)] pt-[clamp(36px,4.4vw,64px)]">
        <header className="mx-auto flex max-w-[780px] flex-col gap-4 px-[clamp(20px,4vw,56px)]">
          <Link href="/blog" className="self-start text-[13.5px] text-ka-muted hover:text-ka-green">
            ← All articles
          </Link>
          <span className="self-start rounded-full bg-ka-mint px-2.5 py-[5px] text-[11px] font-semibold uppercase tracking-[.14em] text-ka-green">{article.category}</span>
          <h1 className="m-0 text-balance font-display text-[clamp(38px,4.6vw,62px)] font-medium leading-[1.06] text-ka-green">{article.title}</h1>
          <span className="text-sm text-ka-muted">
            {article.date} · {article.readTime} · By the {storeName} team
          </span>
        </header>

        <div className="mx-auto my-[clamp(28px,3.6vw,48px)] max-w-[1100px] px-[clamp(20px,4vw,56px)]">
          <ArticleImage tone={article.tone} className="aspect-[16/8]" />
        </div>

        <div className="mx-auto flex max-w-[700px] flex-col gap-[22px] px-[clamp(20px,4vw,56px)] text-[17.5px] leading-[1.85] text-ka-ink">
          <p className="m-0 text-pretty text-[19.5px] leading-[1.7] text-ka-green">
            {article.excerpt} In Kerala, this knowledge was never kept in books alone. It lived in kitchens, courtyards and the daily habits of families.
          </p>
          <p className="m-0 text-pretty">
            Ayurveda sees the body as closely connected to the rhythm of nature. As the seasons change, so do our digestion, energy and sleep. Traditional routines are
            simply ways of staying in step with those changes.
          </p>
          <h2 className={H2}>What the tradition suggests</h2>
          <ul className="m-0 flex list-disc flex-col gap-2.5 pl-[22px]">
            <li>Begin the day with warm water and a few minutes of quiet.</li>
            <li>Eat warm, freshly cooked meals at regular times.</li>
            <li>Include a gentle oil massage before your bath a few times a week.</li>
            <li>Rest early, especially during the monsoon months.</li>
          </ul>
          <blockquote className="my-3.5 border-l-2 border-ka-gold py-2 pl-7 font-display text-[clamp(24px,3vw,28px)] italic leading-[1.35] text-ka-green">
            &ldquo;Small, steady habits, followed through the year, are the heart of Ayurvedic living.&rdquo;
          </blockquote>
          <p className="m-0 text-pretty">
            Warm oil massage, or abhyanga, is one of the most loved practices. Oils such as Dhanwantharam Thailam are traditionally used for full-body massage, helping the
            body feel supple and relaxed.
          </p>
          <ArticleProducts />
          <h2 className={H2}>A gentle start</h2>
          <p className="m-0 text-pretty">
            There is no need to change everything at once. Choose one habit, follow it for a few weeks and notice how you feel. For personal guidance, especially if you
            have a health condition, consult a qualified Ayurvedic physician.
          </p>
          <ArticleShare title={article.title} />
        </div>
      </article>

      <Wave from="#FAF6EE" to="#E8F0E4" shape="b" />
      <section className="relative isolate overflow-clip bg-ka-mint py-[clamp(48px,6vw,88px)]">
        <SectionDecor variant="d" />
        <div className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,56px)]">
          <h2 className="m-0 mb-[clamp(24px,3vw,40px)] font-display text-[clamp(30px,3.2vw,44px)] font-medium text-ka-green">Related articles</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[clamp(20px,2.4vw,32px)]">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={{ ...a, tone: "#FAF6EE" }} showDate={false} pill={false} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
