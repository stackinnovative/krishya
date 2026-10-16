import {
    BLOG_CATEGORIES,
    BLOG_LIMITS as L,
    type BlogBlock,
    type BlogCategory,
    type BlogProps,
    type BlogStatus,
    type IImage,
} from "../types/blog.type.js";
import { toSlug as toSlugWithin } from "../../../core/utils/to.slug.helper.js";

/** A blog slug, capped at the blog URL limit. */
export const toSlug = (text: string): string => toSlugWithin(text, L.slug);

const fitText = (value: string, label: string, max: number, min = 0): string => {
    const text = value.trim();
    if (text.length < min) throw new Error(min === 1 ? `Blog ${label} is required` : `Blog ${label} needs at least ${min} characters`);
    if (text.length > max) throw new Error(`Blog ${label} cannot exceed ${max} characters`);
    return text;
};

const checkImage = (image: IImage, label: string): IImage => {
    if (!image.url || !image.publicId) throw new Error(`Blog ${label} needs both a url and a publicId`);
    return { url: image.url, publicId: image.publicId };
};

const checkBlock = (block: BlogBlock, n: number): BlogBlock => {
    const label = `block ${n}`;
    switch (block.type) {
        case "paragraph":
            return { type: "paragraph", text: fitText(block.text, `${label} paragraph`, L.paragraph, 1) };
        case "heading":
            return { type: "heading", text: fitText(block.text, `${label} heading`, L.heading, 1) };
        case "quote":
            return { type: "quote", text: fitText(block.text, `${label} quote`, L.quote, 1) };
        case "list": {
            const items = block.items.map((item) => item.trim()).filter(Boolean);
            if (items.length === 0 || items.length > L.listItemsMax) throw new Error(`Blog ${label} list needs 1 to ${L.listItemsMax} items`);
            return { type: "list", items: items.map((item) => fitText(item, `${label} list item`, L.listItem, 1)) };
        }
        case "image":
            return { type: "image", image: checkImage(block.image, `${label} photo`), caption: fitText(block.caption, `${label} caption`, L.caption) };
        case "products": {
            const productIds = [...new Set(block.productIds)];
            if (productIds.length === 0 || productIds.length > L.productsPerBlockMax) {
                throw new Error(`Blog ${label} needs 1 to ${L.productsPerBlockMax} products`);
            }
            return { type: "products", productIds };
        }
    }
};

/** Words a reader actually reads - headings, paragraphs, lists, quotes and captions. */
const countWords = (blocks: BlogBlock[]): number =>
    blocks
        .flatMap((b) => {
            if (b.type === "list") return b.items;
            if (b.type === "image") return [b.caption];
            if (b.type === "products") return [];
            return [b.text];
        })
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;

export class Blog {
    public readonly id: string | null;
    public readonly title: string;
    public readonly slug: string;
    public readonly category: BlogCategory;
    public readonly excerpt: string;
    public readonly coverImage: IImage | null;
    public readonly blocks: BlogBlock[];
    public readonly isFeatured: boolean;
    public readonly status: BlogStatus;
    public readonly publishedAt: Date | null;
    public readonly seoTitle: string;
    public readonly seoDescription: string;
    public readonly createdAt: Date | null;
    public readonly updatedAt: Date | null;
    public readonly deletedAt: Date | null;

    constructor(props: BlogProps) {
        this.id = props.id ?? null;
        this.title = fitText(props.title, "title", L.title, 1);

        // An empty slug falls back to the title, so admins never have to type one.
        this.slug = toSlug(props.slug) || toSlug(this.title);
        if (!this.slug) throw new Error("Blog slug needs at least one letter or number");

        if (!BLOG_CATEGORIES.includes(props.category)) throw new Error(`Blog category must be one of: ${BLOG_CATEGORIES.join(", ")}`);
        this.category = props.category;

        this.excerpt = fitText(props.excerpt, "summary", L.excerpt, L.excerptMin);
        this.coverImage = props.coverImage ? checkImage(props.coverImage, "cover photo") : null;

        if (props.blocks.length < L.blocksMin || props.blocks.length > L.blocksMax) {
            throw new Error(`Blog article needs ${L.blocksMin} to ${L.blocksMax} content blocks`);
        }
        this.blocks = props.blocks.map((block, i) => checkBlock(block, i + 1));

        this.status = props.status ?? "draft";
        this.publishedAt = props.publishedAt ?? null;
        if (this.status === "published") {
            if (!this.coverImage) throw new Error("Add a cover photo before publishing the article");
            if (!this.publishedAt) throw new Error("A published article needs a publish date");
        }

        this.isFeatured = props.isFeatured ?? false;
        this.seoTitle = fitText(props.seoTitle ?? "", "SEO title", L.seoTitle);
        this.seoDescription = fitText(props.seoDescription ?? "", "SEO description", L.seoDescription);
        this.createdAt = props.createdAt ?? null;
        this.updatedAt = props.updatedAt ?? null;
        this.deletedAt = props.deletedAt ?? null;
    }

    /** "N min read" - never less than one minute. */
    get readMinutes(): number {
        return Math.max(1, Math.ceil(countWords(this.blocks) / L.wordsPerMinute));
    }

    /** Every product id mentioned in the body, in order of appearance. */
    get productIds(): string[] {
        return [...new Set(this.blocks.flatMap((b) => (b.type === "products" ? b.productIds : [])))];
    }

    /** Cloudinary ids of every photo the article uses (cover + photo blocks). */
    get imageIds(): string[] {
        const blockImages = this.blocks.flatMap((b) => (b.type === "image" ? [b.image.publicId] : []));
        return this.coverImage ? [this.coverImage.publicId, ...blockImages] : blockImages;
    }

    /** Photos this article used that `next` no longer does - safe to delete once `next` is saved. */
    replacedImageIds(next: Blog): string[] {
        const kept = new Set(next.imageIds);
        return this.imageIds.filter((id) => !kept.has(id));
    }

    /** Publishes now, or keeps an earlier/scheduled publish date the admin chose. */
    publish(now: Date = new Date()): Blog {
        if (this.status === "published") throw new Error("Blog article is already published");
        return new Blog({ ...this, status: "published", publishedAt: this.publishedAt ?? now });
    }

    unpublish(): Blog {
        if (this.status === "draft") throw new Error("Blog article is already a draft");
        return new Blog({ ...this, status: "draft" });
    }

    /** Replaces the editable content; status and publish date are resolved by the caller (see resolvePublishedAt). */
    updateDetails(props: BlogContent & { status: BlogStatus; publishedAt: Date | null }): Blog {
        return new Blog({ ...this, ...props });
    }
}

/** Everything the admin edits directly. */
export type BlogContent = Pick<
    BlogProps,
    "title" | "slug" | "category" | "excerpt" | "coverImage" | "blocks" | "isFeatured" | "seoTitle" | "seoDescription"
>;

/**
 * Publish date after a save:
 * - an explicit date from the admin wins (a future one schedules the article);
 * - publishing without one keeps the original date if it was published before, otherwise "now";
 * - a draft keeps whatever date it had, so re-publishing later doesn't move it to the top.
 */
export const resolvePublishedAt = (status: BlogStatus, requested: Date | null | undefined, current: Date | null, now: Date): Date | null => {
    if (requested) return requested;
    if (status === "published") return current ?? now;
    return requested === null ? null : current;
}
