import { Blog } from "../entities/blog.entity.js";
import type {
    AdminBlogListView,
    AdminBlogView,
    BlogBlock,
    BlogCategory,
    BlogListView,
    BlogProductView,
    BlogStatus,
    IImage,
    UserBlogBlock,
    UserBlogView,
} from "../types/blog.type.js";

type StoredImage = { url?: string; publicId?: string } | null | undefined;

/** A blog document as `.lean()` returns it. List queries leave `blocks` out. */
export type BlogRecord = {
    _id?: { toString(): string } | string;
    title: string;
    slug: string;
    category: BlogCategory;
    excerpt: string;
    coverImage?: StoredImage;
    blocks?: BlogBlock[];
    readMinutes?: number;
    isFeatured?: boolean;
    status?: BlogStatus;
    publishedAt?: Date | null;
    seoTitle?: string;
    seoDescription?: string;
    createdAt?: Date | null;
    updatedAt?: Date | null;
};

/** Fields a list query loads - everything but the body. */
export const BLOG_LIST_PROJECTION = { blocks: 0, seoTitle: 0, seoDescription: 0 } as const;

const toImage = (image: StoredImage): IImage | null => (image?.url && image.publicId ? { url: image.url, publicId: image.publicId } : null);

const toIso = (date: Date | null | undefined): string | null => (date ? new Date(date).toISOString() : null);

export class BlogMapper {
    static toDomain(record: BlogRecord | null): Blog | null {
        const id = record?._id?.toString();
        if (!record || !id) return null;

        try {
            return new Blog({
                id,
                title: record.title,
                slug: record.slug,
                category: record.category,
                excerpt: record.excerpt,
                coverImage: toImage(record.coverImage),
                blocks: record.blocks ?? [],
                isFeatured: record.isFeatured ?? false,
                status: record.status ?? "draft",
                publishedAt: record.publishedAt ?? null,
                seoTitle: record.seoTitle ?? "",
                seoDescription: record.seoDescription ?? "",
                createdAt: record.createdAt ?? null,
                updatedAt: record.updatedAt ?? null,
            });
        } catch (error) {
            // One malformed document must not take down the whole page.
            console.error("Blog document failed validation:", id, error);
            return null;
        }
    }

    static toPersistence(entity: Blog) {
        return {
            title: entity.title,
            slug: entity.slug,
            category: entity.category,
            excerpt: entity.excerpt,
            coverImage: entity.coverImage,
            blocks: entity.blocks,
            readMinutes: entity.readMinutes,
            isFeatured: entity.isFeatured,
            status: entity.status,
            publishedAt: entity.publishedAt,
            seoTitle: entity.seoTitle,
            seoDescription: entity.seoDescription,
        };
    }

    /** Card view straight from a list-query record (no body loaded). */
    static toListView(record: BlogRecord): BlogListView | null {
        const id = record._id?.toString();
        if (!id) return null;
        return {
            id,
            title: record.title,
            slug: record.slug,
            category: record.category,
            excerpt: record.excerpt,
            coverImage: toImage(record.coverImage),
            readMinutes: record.readMinutes ?? 1,
            isFeatured: record.isFeatured ?? false,
            publishedAt: toIso(record.publishedAt),
        };
    }

    static toAdminListView(record: BlogRecord): AdminBlogListView | null {
        const card = BlogMapper.toListView(record);
        if (!card) return null;
        return { ...card, status: record.status ?? "draft", updatedAt: toIso(record.updatedAt) };
    }

    private static entityCard(entity: Blog): BlogListView {
        return {
            id: entity.id ?? "",
            title: entity.title,
            slug: entity.slug,
            category: entity.category,
            excerpt: entity.excerpt,
            coverImage: entity.coverImage,
            readMinutes: entity.readMinutes,
            isFeatured: entity.isFeatured,
            publishedAt: toIso(entity.publishedAt),
        };
    }

    static toAdminView(entity: Blog, products: BlogProductView[]): AdminBlogView {
        return {
            ...BlogMapper.entityCard(entity),
            status: entity.status,
            updatedAt: toIso(entity.updatedAt),
            blocks: entity.blocks,
            seoTitle: entity.seoTitle,
            seoDescription: entity.seoDescription,
            products,
        };
    }

    /**
     * Public article: product ids become live products, in the order the admin
     * chose. Products that are gone or inactive are skipped, and a products
     * block left empty is dropped.
     */
    static toUserView(entity: Blog, products: BlogProductView[], related: BlogListView[]): UserBlogView {
        const byId = new Map(products.map((p) => [p.id, p]));
        const blocks = entity.blocks.flatMap((block): UserBlogBlock[] => {
            if (block.type !== "products") return [block];
            const live = block.productIds.flatMap((id) => byId.get(id) ?? []);
            return live.length ? [{ type: "products", products: live }] : [];
        });

        return {
            ...BlogMapper.entityCard(entity),
            blocks,
            seoTitle: entity.seoTitle,
            seoDescription: entity.seoDescription,
            related,
        };
    }
}
