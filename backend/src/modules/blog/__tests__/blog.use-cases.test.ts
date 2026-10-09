import "reflect-metadata";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Blog } from "../entities/blog.entity.js";
import type { IBlogRepository } from "../repositories/blog.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { BlogListView } from "../types/blog.type.js";
import { CreateBlogUseCase } from "../use-cases/create.blog.use-case.js";
import { EditBlogUseCase } from "../use-cases/edit.blog.use-case.js";
import { DeleteBlogUseCase } from "../use-cases/delete.blog.use-case.js";
import { PublishBlogUseCase } from "../use-cases/publish.blog.use-case.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { blogDto, blogInput, image, PRODUCT_A } from "./blog.fixtures.js";

/** In-memory blog store - only what the write use-cases touch. */
class FakeBlogRepository implements IBlogRepository {
    rows = new Map<string, Blog>();
    nextId = 1;
    featuredCleared: string[] = [];

    async create(entity: Blog) {
        const id = `b${this.nextId++}`;
        const saved = new Blog({ ...entity, id });
        this.rows.set(id, saved);
        return saved;
    }
    async findById(id: string) {
        return this.rows.get(id) ?? null;
    }
    async findPublishedBySlug() {
        return null;
    }
    async isSlugTaken(slug: string, exceptId?: string | null) {
        return [...this.rows.values()].some((b) => b.slug === slug && b.id !== exceptId);
    }
    async save(entity: Blog) {
        this.rows.set(entity.id!, entity);
        return entity;
    }
    async delete(id: string) {
        this.rows.delete(id);
    }
    async clearFeatured(exceptId: string) {
        this.featuredCleared.push(exceptId);
    }
    async findAllForAdmin() {
        return { data: [], total: 0 };
    }
    async findPublished() {
        return { data: [], total: 0 };
    }
    async findFeaturedPublished() {
        return null;
    }
    async findRelated(): Promise<BlogListView[]> {
        return [];
    }
}

/** Only `findByIds` is used by the blog use-cases. */
const products = {
    async findByIds(ids: string[]) {
        return ids.map((id) => ({ id, name: `Product ${id.slice(-1)}`, price: 240, image: "https://x/p.jpg" }));
    },
} as Pick<IProductRepository, "findByIds"> as IProductRepository;

class TestEditBlogUseCase extends EditBlogUseCase {
    removed: string[] = [];
    protected override async removeImage(publicId: string) {
        this.removed.push(publicId);
    }
}

class TestDeleteBlogUseCase extends DeleteBlogUseCase {
    removed: string[] = [];
    protected override async removeImage(publicId: string) {
        this.removed.push(publicId);
    }
}

const statusOf = async (promise: Promise<unknown>) => {
    try {
        await promise;
        return 0;
    } catch (err) {
        return err instanceof CustomError ? err.statusCode : -1;
    }
};

describe("CreateBlogUseCase", () => {
    it("creates a draft with a slug from the title and resolves its products", async () => {
        const repo = new FakeBlogRepository();
        const view = await new CreateBlogUseCase(repo, products).execute(blogDto());
        assert.equal(view.slug, "karkidakam-preparing-for-the-monsoon");
        assert.equal(view.status, "draft");
        assert.equal(view.publishedAt, null);
        assert.deepEqual(
            view.products.map((p) => p.id),
            [PRODUCT_A]
        );
    });

    it("publishes straight away when asked, dated now", async () => {
        const view = await new CreateBlogUseCase(new FakeBlogRepository(), products).execute(blogDto({ status: "published" }));
        assert.equal(view.status, "published");
        assert.ok(view.publishedAt && Date.now() - Date.parse(view.publishedAt) < 5000);
    });

    it("refuses a URL another article already uses (409)", async () => {
        const repo = new FakeBlogRepository();
        const useCase = new CreateBlogUseCase(repo, products);
        await useCase.execute(blogDto());
        assert.equal(await statusOf(useCase.execute(blogDto())), 409);
        assert.equal(await statusOf(useCase.execute(blogDto({ title: "!!!" }))), 400);
    });

    it("keeps featured to one article", async () => {
        const repo = new FakeBlogRepository();
        const view = await new CreateBlogUseCase(repo, products).execute(blogDto({ isFeatured: true }));
        assert.deepEqual(repo.featuredCleared, [view.id]);
    });
});

describe("EditBlogUseCase", () => {
    it("saves changes and deletes only the photos no longer used", async () => {
        const repo = new FakeBlogRepository();
        const created = await repo.create(new Blog(blogInput()));
        const useCase = new TestEditBlogUseCase(repo, products);

        const dto = blogDto({ coverImage: image("cover-new"), title: "A new title", slug: "karkidakam-preparing-for-the-monsoon" });
        const view = await useCase.execute(created.id!, dto);

        assert.equal(view.title, "A new title");
        assert.equal(view.slug, "karkidakam-preparing-for-the-monsoon");
        assert.deepEqual(useCase.removed, ["cover"]);
    });

    it("keeps the original publish date when a published article is edited", async () => {
        const repo = new FakeBlogRepository();
        const firstPublished = new Date("2026-01-01T00:00:00.000Z");
        const created = await repo.create(new Blog({ ...blogInput(), status: "published", publishedAt: firstPublished }));

        const view = await new TestEditBlogUseCase(repo, products).execute(created.id!, blogDto({ status: "published" }));
        assert.equal(view.publishedAt, firstPublished.toISOString());
    });

    it("returns 404 for an unknown article", async () => {
        assert.equal(await statusOf(new TestEditBlogUseCase(new FakeBlogRepository(), products).execute("missing", blogDto())), 404);
    });
});

describe("DeleteBlogUseCase", () => {
    it("removes the article and every photo it used", async () => {
        const repo = new FakeBlogRepository();
        const created = await repo.create(new Blog(blogInput()));
        const useCase = new TestDeleteBlogUseCase(repo);

        await useCase.execute(created.id!);
        assert.equal(repo.rows.size, 0);
        assert.deepEqual(useCase.removed.sort(), ["cover", "inline"]);
    });
});

describe("PublishBlogUseCase", () => {
    it("needs a cover photo and refuses to publish twice", async () => {
        const repo = new FakeBlogRepository();
        const noCover = await repo.create(new Blog({ ...blogInput(), coverImage: null }));
        const ready = await repo.create(new Blog(blogInput()));
        const useCase = new PublishBlogUseCase(repo);

        assert.equal(await statusOf(useCase.execute(noCover.id!)), 400);
        await useCase.execute(ready.id!);
        assert.equal(repo.rows.get(ready.id!)?.status, "published");
        assert.equal(await statusOf(useCase.execute(ready.id!)), 400);
    });
});
