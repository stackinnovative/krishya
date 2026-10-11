import { Blog } from "../entities/blog.entity.js";
import type { AdminBlogListView, BlogCategory, BlogListView, BlogStatus, PaginatedBlogList } from "../types/blog.type.js";

export type PublishedBlogFilter = {
    page: number;
    limit: number;
    category?: BlogCategory | undefined;
    /** Leaves one article out - the featured one shown above the list. */
    excludeId?: string | undefined;
};

export type AdminBlogFilter = {
    page: number;
    limit: number;
    search: string;
    status?: BlogStatus | "scheduled" | undefined;
    category?: BlogCategory | undefined;
    sort: "newest" | "oldest";
    deleted?: boolean | "all";
};

export interface IBlogRepository {
    create(blogEntity: Blog): Promise<Blog>;
    findById(id: string, includeDeleted?: boolean): Promise<Blog | null>;
    /** Only an article that is published and whose publish date has passed. */
    findPublishedBySlug(slug: string, now: Date): Promise<Blog | null>;
    isSlugTaken(slug: string, exceptId?: string | null): Promise<boolean>;
    save(blogEntity: Blog): Promise<Blog>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;
    restore(id: string): Promise<void>;
    findAllForAdmin(filter: AdminBlogFilter): Promise<PaginatedBlogList<AdminBlogListView>>;
    findPublished(filter: PublishedBlogFilter, now: Date): Promise<PaginatedBlogList<BlogListView>>;
    /** The featured article if it is live, otherwise the newest live one. */
    findFeaturedPublished(now: Date): Promise<BlogListView | null>;
    /** Same-category articles first, then the newest others. */
    findRelated(blog: Blog, limit: number, now: Date): Promise<BlogListView[]>;
}
