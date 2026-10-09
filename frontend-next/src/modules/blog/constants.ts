/** Mirrors BLOG_CATEGORIES in backend/src/modules/blog/types/blog.type.ts. */
export const BLOG_CATEGORIES = ["Ayurveda Basics", "Seasonal Care", "Herbs Guide", "Lifestyle"] as const;

/** Mirrors BLOG_LIMITS in the backend. */
export const BLOG_LIMITS = {
  title: 120,
  slug: 140,
  excerptMin: 20,
  excerpt: 300,
  seoTitle: 70,
  seoDescription: 160,
  blocksMin: 1,
  blocksMax: 60,
  paragraph: 3000,
  heading: 120,
  listItem: 300,
  listItemsMax: 20,
  quote: 400,
  caption: 160,
  productsPerBlockMax: 3,
} as const;

/** Cover photo crop - the card ratio; the article header shows a wider slice of it. */
export const BLOG_COVER_RATIO = 3 / 2;
/** Photos inside the article body. */
export const BLOG_INLINE_RATIO = 3 / 2;

/** Articles per page on the Journal index (a 3-column grid). */
export const BLOG_PAGE_SIZE = 9;
