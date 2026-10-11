import "reflect-metadata";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ClientSession } from "mongoose";
import { BlogRepository } from "../repositories/blog.repository.js";
import { BlogModel, BlogFeatureLockModel } from "../infrastructure/blog.schema.js";
import { Blog } from "../entities/blog.entity.js";
import { blogInput } from "./blog.fixtures.js";

const id = "64b000000000000000000001";
const otherId = "64b000000000000000000002";
const record = (articleId: string, isFeatured: boolean) => ({ _id: articleId, ...blogInput(), isFeatured });

describe("BlogRepository Featured handover", () => {
    it("clears the previous Featured inside the same transaction before saving the selected article", async (t) => {
        const calls: string[] = [];
        const session = {
            withTransaction: async (work: () => Promise<Blog>) => { calls.push("begin"); const value = await work(); calls.push("commit"); return value; },
            endSession: async () => { calls.push("end"); },
        } as unknown as ClientSession;
        t.mock.method(BlogModel.db, "startSession", async () => session);
        t.mock.method(BlogFeatureLockModel, "updateOne", async (_filter: unknown, _update: unknown, options: { session?: ClientSession }) => {
            calls.push(options.session ? "lock" : "initialize");
            if (options.session) assert.equal(options.session, session);
        });
        t.mock.method(BlogModel, "updateMany", async (filter: unknown, update: unknown, options: { session: ClientSession }) => {
            calls.push("clear");
            assert.deepEqual(filter, { _id: { $ne: id }, isFeatured: true });
            assert.deepEqual(update, { $set: { isFeatured: false } });
            assert.equal(options.session, session);
        });
        t.mock.method(BlogModel, "findOneAndUpdate", (filter: unknown, update: { $set: { isFeatured: boolean } }, options: { session: ClientSession }) => {
            calls.push("save");
            assert.deepEqual(filter, { _id: id, deletedAt: null });
            assert.equal(update.$set.isFeatured, true);
            assert.equal(options.session, session);
            return { lean: async () => record(id, true) };
        });
        const saved = await new BlogRepository().save(new Blog({ ...blogInput(), id, isFeatured: true }));
        assert.equal(saved.isFeatured, true);
        assert.deepEqual(calls, ["initialize", "begin", "lock", "clear", "save", "commit", "end"]);
    });

    it("preserves the old Featured article when saving fails and always ends the session", async (t) => {
        let featured = otherId;
        let ended = false;
        const session = {
            withTransaction: async (work: () => Promise<Blog>) => {
                const before = featured;
                try { return await work(); } catch (error) { featured = before; throw error; }
            },
            endSession: async () => { ended = true; },
        } as unknown as ClientSession;
        t.mock.method(BlogModel.db, "startSession", async () => session);
        t.mock.method(BlogFeatureLockModel, "updateOne", async () => undefined);
        t.mock.method(BlogModel, "updateMany", async (_filter: unknown, _update: unknown, options: { session: ClientSession }) => {
            assert.equal(options.session, session);
            featured = "";
        });
        t.mock.method(BlogModel, "findOneAndUpdate", () => ({ lean: async () => { throw new Error("Save failed"); } }));
        await assert.rejects(new BlogRepository().save(new Blog({ ...blogInput(), id, isFeatured: true })), /Save failed/);
        assert.equal(featured, otherId);
        assert.equal(ended, true);
    });

    it("does not start a transaction or clear another article when saving an unfeatured article", async (t) => {
        t.mock.method(BlogModel.db, "startSession", () => { throw new Error("Unexpected transaction"); });
        t.mock.method(BlogModel, "updateMany", () => { throw new Error("Unexpected Featured change"); });
        t.mock.method(BlogModel, "findOneAndUpdate", (_filter: unknown, _update: unknown, options: { session: ClientSession | null }) => {
            assert.equal(options.session, null);
            return { lean: async () => record(id, false) };
        });
        const saved = await new BlogRepository().save(new Blog({ ...blogInput(), id }));
        assert.equal(saved.isFeatured, false);
    });
});

describe("BlogRepository trash visibility", () => {
    it("excludes trash from public list, Featured fallback, slug lookup and related articles", async (t) => {
        const queries: Record<string, unknown>[] = [];
        const query = {
            sort() { return this; }, skip() { return this; }, limit() { return this; },
            lean: async () => [],
        };
        t.mock.method(BlogModel, "find", (filter: Record<string, unknown>) => { queries.push(filter); return query; });
        t.mock.method(BlogModel, "countDocuments", async (filter: Record<string, unknown>) => { queries.push(filter); return 0; });
        t.mock.method(BlogModel, "findOne", (filter: Record<string, unknown>) => {
            queries.push(filter);
            return { sort() { return this; }, lean: async () => null };
        });
        const repo = new BlogRepository();
        const now = new Date();
        await repo.findPublished({ page: 1, limit: 4 }, now);
        await repo.findFeaturedPublished(now);
        await repo.findPublishedBySlug("article", now);
        await repo.findRelated(new Blog({ ...blogInput(), id }), 3, now);
        assert.equal(queries.length, 7);
        for (const filter of queries) {
            assert.equal(filter.deletedAt, null);
            assert.equal(filter.status, "published");
            assert.deepEqual(filter.publishedAt, { $lte: now });
        }
    });

    it("includes blocked articles in All and supports separate active and blocked filters", async (t) => {
        const queries: Record<string, unknown>[] = [];
        const query = { sort() { return this; }, skip() { return this; }, limit() { return this; }, lean: async () => [] };
        t.mock.method(BlogModel, "find", (filter: Record<string, unknown>) => { queries.push(filter); return query; });
        t.mock.method(BlogModel, "countDocuments", async () => 0);
        const repo = new BlogRepository();
        const filter = { page: 1, limit: 25, search: "", sort: "newest" as const };
        await repo.findAllForAdmin(filter);
        await repo.findAllForAdmin({ ...filter, deleted: true });
        await repo.findAllForAdmin({ ...filter, deleted: "all" });
        assert.deepEqual(queries, [{ deletedAt: null }, { deletedAt: { $ne: null } }, {}]);
    });

    it("separates scheduled articles from live published articles before counting and pagination", async (t) => {
        const queries: Record<string, unknown>[] = [];
        const query = { sort() { return this; }, skip() { return this; }, limit() { return this; }, lean: async () => [] };
        t.mock.method(BlogModel, "find", (filter: Record<string, unknown>) => { queries.push(filter); return query; });
        t.mock.method(BlogModel, "countDocuments", async (filter: Record<string, unknown>) => { queries.push(filter); return 0; });
        const repo = new BlogRepository();
        const filter = { page: 1, limit: 25, search: "", sort: "newest" as const };
        await repo.findAllForAdmin({ ...filter, status: "scheduled" });
        await repo.findAllForAdmin({ ...filter, status: "published" });
        assert.deepEqual(queries[0], queries[1]);
        assert.deepEqual(queries[2], queries[3]);
        assert.equal(queries[0]?.status, "published");
        assert.equal(queries[0]?.deletedAt, null);
        assert.ok((queries[0]?.publishedAt as { $gt: Date }).$gt instanceof Date);
        assert.ok((queries[2]?.publishedAt as { $lte: Date }).$lte instanceof Date);
    });

    it("permanently deletes by id without requiring the article to be blocked", async (t) => {
        t.mock.method(BlogModel, "findByIdAndDelete", async (articleId: string) => {
            assert.equal(articleId, id);
            return record(id, false);
        });
        await new BlogRepository().delete(id);
    });

    it("unblocks without changing the publishing status or restoring Featured", async (t) => {
        t.mock.method(BlogModel, "updateOne", async (filter: unknown, update: unknown) => {
            assert.deepEqual(filter, { _id: id, deletedAt: { $ne: null } });
            assert.deepEqual(update, { $set: { deletedAt: null, isFeatured: false } });
        });
        await new BlogRepository().restore(id);
    });

    it("prevents a stale editor save from reviving a trashed article", async (t) => {
        t.mock.method(BlogModel, "findOneAndUpdate", (filter: unknown) => {
            assert.deepEqual(filter, { _id: id, deletedAt: null });
            return { lean: async () => null };
        });
        await assert.rejects(new BlogRepository().save(new Blog({ ...blogInput(), id })), /not found/);
    });
});
