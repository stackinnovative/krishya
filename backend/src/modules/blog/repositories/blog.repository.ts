import { injectable } from "tsyringe";
import type { ClientSession, QueryFilter } from "mongoose";
import type { AdminBlogFilter, IBlogRepository, PublishedBlogFilter } from "./blog.repository.interface.js";
import { Blog } from "../entities/blog.entity.js";
import { BlogModel, BlogFeatureLockModel, type IBlog } from "../infrastructure/blog.schema.js";
import { BLOG_LIST_PROJECTION, BlogMapper, type BlogRecord } from "../mappers/blog.mapper.js";
import type { AdminBlogListView, BlogListView, PaginatedBlogList } from "../types/blog.type.js";

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Live = published and its publish date has passed (a future date is a scheduled article). */
const liveQuery = (now: Date): QueryFilter<IBlog> => ({ deletedAt: null, status: "published", publishedAt: { $lte: now } });

const NEWEST_FIRST = { publishedAt: -1, _id: -1 } as const;

const toCards = (records: BlogRecord[]): BlogListView[] =>
    records.map((r) => BlogMapper.toListView(r)).filter((r): r is BlogListView => r !== null);

@injectable()
export class BlogRepository implements IBlogRepository {
    async create(blogEntity: Blog): Promise<Blog> {
        return this.writeWithFeatured(blogEntity, async (session) => {
            const [created] = await BlogModel.create([BlogMapper.toPersistence(blogEntity)], { session });
            return BlogMapper.toDomain(created!.toObject() as BlogRecord)!;
        });
    }

    async findById(id: string, includeDeleted = false): Promise<Blog | null> {
        const blog = await BlogModel.findOne({ _id: id, ...(includeDeleted ? {} : { deletedAt: null }) }).lean<BlogRecord>();
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

        return this.writeWithFeatured(blogEntity, async (session) => {
            const updated = await BlogModel.findOneAndUpdate(
                { _id: id, deletedAt: null },
                { $set: BlogMapper.toPersistence(blogEntity) },
                { new: true, runValidators: true, session }
            ).lean<BlogRecord>();
            if (!updated) throw new Error("Blog not found for update");
            return BlogMapper.toDomain(updated)!;
        });
    }

    async delete(id: string): Promise<void> {
        const deleted = await BlogModel.findByIdAndDelete(id);
        if (!deleted) throw new Error("Article not found for deletion");
    }

    async softDelete(id: string): Promise<void> {
        await BlogModel.updateOne({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date(), isFeatured: false } });
    }

    async restore(id: string): Promise<void> {
        await BlogModel.updateOne({ _id: id, deletedAt: { $ne: null } }, { $set: { deletedAt: null, isFeatured: false } });
    }

    private async writeWithFeatured(blog: Blog, write: (session: ClientSession | null) => Promise<Blog>): Promise<Blog> {
        if (!blog.isFeatured) return write(null);

        // Initialize outside the transaction; concurrent first-time initialization is harmless.
        try {
            await BlogFeatureLockModel.updateOne({ _id: "featured" }, { $setOnInsert: { version: 0 } }, { upsert: true });
        } catch (error) {
            if (!(error instanceof Error && "code" in error && error.code === 11000)) throw error;
        }

        const session = await BlogModel.db.startSession();
        try {
            return await session.withTransaction(async () => {
                await BlogFeatureLockModel.updateOne({ _id: "featured" }, { $inc: { version: 1 } }, { session });
                await BlogModel.updateMany(
                    { ...(blog.id ? { _id: { $ne: blog.id } } : {}), isFeatured: true },
                    { $set: { isFeatured: false } },
                    { session }
                );
                return write(session);
            });
        } finally {
            await session.endSession();
        }
    }

    async findAllForAdmin(filter: AdminBlogFilter): Promise<PaginatedBlogList<AdminBlogListView>> {
        const query: QueryFilter<IBlog> = filter.deleted === "all" ? {} : { deletedAt: filter.deleted ? { $ne: null } : null };
        if (filter.status === "scheduled") {
            query.status = "published";
            query.publishedAt = { $gt: new Date() };
        } else if (filter.status === "published") {
            query.status = "published";
            query.publishedAt = { $lte: new Date() };
        } else if (filter.status) {
            query.status = filter.status;
        }
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
