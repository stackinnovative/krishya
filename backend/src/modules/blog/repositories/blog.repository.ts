import { injectable } from "tsyringe";
import type { QueryFilter } from "mongoose";
import type { AdminBlogFilter, IBlogRepository, PublishedBlogFilter } from "./blog.repository.interface.js";
import { Blog } from "../entities/blog.entity.js";
import { BlogModel, type IBlog } from "../infrastructure/blog.schema.js";
import { BLOG_LIST_PROJECTION, BlogMapper, type BlogRecord } from "../mappers/blog.mapper.js";
import type { AdminBlogListView, BlogListView, PaginatedBlogList } from "../types/blog.type.js";

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Live = published and its publish date has passed (a future date is a scheduled article). */
const liveQuery = (now: Date): QueryFilter<IBlog> => ({ status: "published", publishedAt: { $lte: now } });

const NEWEST_FIRST = { publishedAt: -1, _id: -1 } as const;

const toCards = (records: BlogRecord[]): BlogListView[] =>
    records.map((r) => BlogMapper.toListView(r)).filter((r): r is BlogListView => r !== null);

@injectable()
export class BlogRepository implements IBlogRepository {
    async create(blogEntity: Blog): Promise<Blog> {
        const created = await BlogModel.create(BlogMapper.toPersistence(blogEntity));
        return BlogMapper.toDomain(created.toObject() as BlogRecord)!;
    }

    async findById(id: string): Promise<Blog | null> {
        const blog = await BlogModel.findById(id).lean<BlogRecord>();
        return BlogMapper.toDomain(blog);
    }

    async findPublishedBySlug(slug: string, now: Date): Promise<Blog | null> {
        const blog = await BlogModel.findOne({ ...liveQuery(now), slug: slug.toLowerCase() }).lean<BlogRecord>();
        return BlogMapper.toDomain(blog);
    }

    async isSlugTaken(slug: string, exceptId?: string | null): Promise<boolean> {
        const query: QueryFilter<IBlog> = { slug };
        if (exceptId) query._id = { $ne: exceptId };
        return (await BlogModel.exists(query)) !== null;
    }

    async save(blogEntity: Blog): Promise<Blog> {
        const { id } = blogEntity;
        if (!id) {
            throw new Error("Cannot save blog without an ID");
        }

        const updated = await BlogModel.findByIdAndUpdate(
            id,
            { $set: BlogMapper.toPersistence(blogEntity) },
            { new: true, runValidators: true }
        ).lean<BlogRecord>();

        if (!updated) {
            throw new Error("Blog not found for update");
        }

        return BlogMapper.toDomain(updated)!;
    }

    async delete(id: string): Promise<void> {
        await BlogModel.findByIdAndDelete(id);
    }

    async clearFeatured(exceptId: string): Promise<void> {
        await BlogModel.updateMany({ _id: { $ne: exceptId }, isFeatured: true }, { $set: { isFeatured: false } });
    }

    async findAllForAdmin(filter: AdminBlogFilter): Promise<PaginatedBlogList<AdminBlogListView>> {
        const query: QueryFilter<IBlog> = {};
        if (filter.status) query.status = filter.status;
        if (filter.category) query.category = filter.category;
        if (filter.search.trim()) {
            const pattern = { $regex: escapeRegex(filter.search.trim()), $options: "i" };
            query.$or = [{ title: pattern }, { excerpt: pattern }];
        }

        const [records, total] = await Promise.all([
            BlogModel.find(query, BLOG_LIST_PROJECTION)
                .sort({ updatedAt: filter.sort === "oldest" ? 1 : -1 })
                .skip((filter.page - 1) * filter.limit)
                .limit(filter.limit)
                .lean<BlogRecord[]>(),
            BlogModel.countDocuments(query),
        ]);

        const data = records.map((r) => BlogMapper.toAdminListView(r)).filter((r): r is AdminBlogListView => r !== null);
        return { data, total };
    }

    async findPublished(filter: PublishedBlogFilter, now: Date): Promise<PaginatedBlogList<BlogListView>> {
        const query = liveQuery(now);
        if (filter.category) query.category = filter.category;
        if (filter.excludeId) query._id = { $ne: filter.excludeId };

        const [records, total] = await Promise.all([
            BlogModel.find(query, BLOG_LIST_PROJECTION)
                .sort(NEWEST_FIRST)
                .skip((filter.page - 1) * filter.limit)
                .limit(filter.limit)
                .lean<BlogRecord[]>(),
            BlogModel.countDocuments(query),
        ]);

        return { data: toCards(records), total };
    }

    async findFeaturedPublished(now: Date): Promise<BlogListView | null> {
        const featured = await BlogModel.findOne({ ...liveQuery(now), isFeatured: true }, BLOG_LIST_PROJECTION).sort(NEWEST_FIRST).lean<BlogRecord>();
        const record = featured ?? (await BlogModel.findOne(liveQuery(now), BLOG_LIST_PROJECTION).sort(NEWEST_FIRST).lean<BlogRecord>());
        return record ? BlogMapper.toListView(record) : null;
    }

    async findRelated(blog: Blog, limit: number, now: Date): Promise<BlogListView[]> {
        const sameCategory = await BlogModel.find({ ...liveQuery(now), _id: { $ne: blog.id }, category: blog.category }, BLOG_LIST_PROJECTION)
            .sort(NEWEST_FIRST)
            .limit(limit)
            .lean<BlogRecord[]>();
        if (sameCategory.length >= limit) return toCards(sameCategory);

        const others = await BlogModel.find({ ...liveQuery(now), _id: { $ne: blog.id }, category: { $ne: blog.category } }, BLOG_LIST_PROJECTION)
            .sort(NEWEST_FIRST)
            .limit(limit - sameCategory.length)
            .lean<BlogRecord[]>();
        return toCards([...sameCategory, ...others]);
    }
}
