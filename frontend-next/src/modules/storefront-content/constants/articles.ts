/**
 * Journal articles from the Krishay design. There's no blog backend yet, so
 * the copy lives here; each entry is a page at /blog/<slug>.
 */
export type Article = {
  slug: string;
  title: string;
  category: ArticleCategory;
  date: string;
  readTime: string;
  excerpt: string;
  /** Background tint for the article's image panel. */
  tone: string;
};

export const ARTICLE_CATEGORIES = ["Ayurveda Basics", "Seasonal Care", "Herbs Guide", "Lifestyle"] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

const TONES = ["#E8F0E4", "#EFE6D8", "#E4EADB", "#F1E7D2"];

const RAW_ARTICLES: Omit<Article, "tone">[] = [
  {
    slug: "karkidakam-monsoon-care",
    title: "Karkidakam: Preparing for the Monsoon, the Kerala Way",
    category: "Seasonal Care",
    date: "18 Sep 2026",
    readTime: "6 min read",
    excerpt: "Why the month of Karkidakam has long been set aside for rest, simple food and warm oil massage in Kerala homes.",
  },
  {
    slug: "dinacharya-daily-routine",
    title: "Dinacharya: A Simple Ayurvedic Daily Routine",
    category: "Ayurveda Basics",
    date: "10 Sep 2026",
    readTime: "5 min read",
    excerpt: "Small morning and evening habits that bring steadiness to the day.",
  },
  {
    slug: "tulsi-kerala-courtyard",
    title: "Tulsi: The Herb in Every Kerala Courtyard",
    category: "Herbs Guide",
    date: "2 Sep 2026",
    readTime: "4 min read",
    excerpt: "How holy basil became part of daily life, and simple ways to enjoy it.",
  },
  {
    slug: "warm-oil-massage-abhyanga",
    title: "Why Warm Oil Massage Has Lasted Centuries",
    category: "Lifestyle",
    date: "26 Aug 2026",
    readTime: "7 min read",
    excerpt: "A closer look at abhyanga and how to begin the practice at home.",
  },
  {
    slug: "vata-pitta-kapha",
    title: "Understanding Vata, Pitta and Kapha",
    category: "Ayurveda Basics",
    date: "19 Aug 2026",
    readTime: "8 min read",
    excerpt: "A plain-language introduction to the three doshas.",
  },
  {
    slug: "turmeric-beyond-the-kitchen",
    title: "Turmeric Beyond the Kitchen",
    category: "Herbs Guide",
    date: "11 Aug 2026",
    readTime: "5 min read",
    excerpt: "The traditional uses of haridra, from skin care to seasonal routines.",
  },
  {
    slug: "skin-care-dry-months",
    title: "Caring for Skin Through the Dry Months",
    category: "Seasonal Care",
    date: "4 Aug 2026",
    readTime: "4 min read",
    excerpt: "Traditional oils and simple habits for skin that feels comfortable.",
  },
  {
    slug: "eating-with-the-seasons",
    title: "Eating with the Seasons",
    category: "Lifestyle",
    date: "28 Jul 2026",
    readTime: "6 min read",
    excerpt: "What Ayurveda suggests about matching meals to the weather.",
  },
];

export const ARTICLES: Article[] = RAW_ARTICLES.map((a, i) => ({ ...a, tone: TONES[i % TONES.length] ?? "#E8F0E4" }));

export const getArticleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);

/** Same-category articles first, then the rest - the article page's "Related articles". */
export const getRelatedArticles = (article: Article, count = 3) =>
  [...ARTICLES.filter((a) => a.category === article.category && a.slug !== article.slug), ...ARTICLES.filter((a) => a.category !== article.category)].slice(
    0,
    count,
  );
