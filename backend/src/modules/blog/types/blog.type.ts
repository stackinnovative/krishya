export type IImage = {
    url: string;
    publicId: string;
};

/** Fixed topics shown as filter pills on the Journal page. */
export const BLOG_CATEGORIES = ["Ayurveda Basics", "Seasonal Care", "Herbs Guide", "Lifestyle"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_STATUSES = ["draft", "published"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

/** Shared by the DTO (request errors) and the entity (invariants). */
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
    /** Reading speed used for the "N min read" label. */
    wordsPerMinute: 200,
} as const;

/**
 * The article body is an ordered list of blocks instead of free HTML, so it
 * always renders in the storefront's own typography and can't break the layout.
 */
export type BlogBlock =
    | { type: "paragraph"; text: string }
    | { type: "heading"; text: string }
    | { type: "list"; items: string[] }
    | { type: "quote"; text: string }
    | { type: "image"; image: IImage; caption: string }
    | { type: "products"; productIds: string[] };

export type BlogBlockType = BlogBlock["type"];

export type BlogProps = {
    id?: string | null;
    title: string;
    slug: string;
    category: BlogCategory;
    excerpt: string;
    /** Required before publishing; a draft may still be missing it. */
    coverImage: IImage | null;
    blocks: BlogBlock[];
    isFeatured?: boolean;
    status?: BlogStatus;
    /** Set when first published; a future date keeps the article hidden until then. */
    publishedAt?: Date | null;
    seoTitle?: string;
    seoDescription?: string;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
};

/** A product shown in a "From our range" block - same shape as the storefront product cards. */
export type BlogProductView = {
    id: string;
    name: string;
    /** For the /products/<slug> link. */
    slug: string;
    price: number;
    image: string;
};

/** Card on the Journal index, the home page and "Related articles". */
export type BlogListView = {
    id: string;
    title: string;
    slug: string;
    category: BlogCategory;
    excerpt: string;
    coverImage: IImage | null;
    readMinutes: number;
    isFeatured: boolean;
    publishedAt: string | null;
};

/** Row in the admin article table. */
export type AdminBlogListView = BlogListView & {
    status: BlogStatus;
    updatedAt: string | null;
    deletedAt: string | null;
};

/** Full article for the admin editor - blocks keep their raw product ids. */
export type AdminBlogView = AdminBlogListView & {
    blocks: BlogBlock[];
    seoTitle: string;
    seoDescription: string;
    /** Labels for the product ids used in the blocks (active products only). */
    products: BlogProductView[];
};

/** A block as the storefront renders it - product ids resolved to live products. */
export type UserBlogBlock = Exclude<BlogBlock, { type: "products" }> | { type: "products"; products: BlogProductView[] };

/** Public article page. */
export type UserBlogView = BlogListView & {
    blocks: UserBlogBlock[];
    seoTitle: string;
    seoDescription: string;
    related: BlogListView[];
};

export type PaginatedBlogList<T> = {
    data: T[];
    total: number;
};
