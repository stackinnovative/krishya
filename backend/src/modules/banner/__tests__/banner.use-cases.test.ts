import "reflect-metadata";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Banner } from "../entities/banner.entity.js";
import type { IBannerRepository } from "../repositories/banner.repository.interface.js";
import { CreateBannerUseCase } from "../use-cases/create.banner.use-case.js";
import { UnblockBannerUseCase } from "../use-cases/unblock.banner.use-case.js";
import { BlockBannerUseCase } from "../use-cases/block.banner.use-case.js";
import { EditBannerUseCase } from "../use-cases/edit.banner.use-case.js";
import { GetBannerUserUseCase } from "../use-cases/get.banner.user.use-case.js";
import { CustomError } from "../../../core/errors/custom.error.js";

const image = (publicId: string) => ({ url: `https://res.cloudinary.com/demo/image/upload/${publicId}.jpg`, publicId });
const banner = (id: string, isActive: boolean) => new Banner({ id, image: image(`img-${id}`), isActive });

/** In-memory banners, oldest first (as findAll returns them). */
class FakeBannerRepository implements IBannerRepository {
    rows: Banner[];
    nextId = 100;
    constructor(rows: Banner[] = []) {
        this.rows = rows;
    }
    async create(entity: Banner) {
        const saved = new Banner({ ...entity, id: `b${this.nextId++}` });
        this.rows.push(saved);
        return saved;
    }
    async findById(id: string) {
        return this.rows.find((b) => b.id === id) ?? null;
    }
    async findAll() {
        return [...this.rows];
    }
    async save(entity: Banner) {
        this.rows = this.rows.map((b) => (b.id === entity.id ? entity : b));
        return entity;
    }
    async delete(id: string) {
        this.rows = this.rows.filter((b) => b.id !== id);
    }
    async deactivateAllExcept(id: string) {
        this.rows = this.rows.map((b) => (b.id !== id && b.isActive ? b.deactivate() : b));
    }
    async getBannerUser() {
        return [...this.rows]
            .reverse()
            .filter((b) => b.isActive)
            .map((b) => ({ id: b.id!, image: { url: b.image.url }, buttonUrl: b.buttonUrl }));
    }
    async getBannerAdmin() {
        return this.rows.map((b) => ({ id: b.id!, image: b.image, buttonUrl: b.buttonUrl, isActive: b.isActive }));
    }
}

const live = (repo: FakeBannerRepository) => repo.rows.filter((b) => b.isActive).map((b) => b.id);

const statusOf = async (promise: Promise<unknown>) => {
    try {
        await promise;
        return 0;
    } catch (err) {
        return err instanceof CustomError ? err.statusCode : -1;
    }
};

describe("Banner: one live at a time", () => {
    it("puts a new banner live and switches the previous one off", async () => {
        const repo = new FakeBannerRepository([banner("a", true)]);
        await new CreateBannerUseCase(repo).execute({ image: image("new") });
        assert.equal(repo.rows.length, 2);
        assert.deepEqual(live(repo), ["b100"]);
    });

    it("refuses a 4th banner instead of deleting the oldest", async () => {
        const repo = new FakeBannerRepository([banner("a", false), banner("b", false), banner("c", true)]);
        assert.equal(await statusOf(new CreateBannerUseCase(repo).execute({ image: image("new") })), 400);
        assert.deepEqual(
            repo.rows.map((b) => b.id),
            ["a", "b", "c"]
        );
    });

    it("turning a banner on switches the live one off", async () => {
        const repo = new FakeBannerRepository([banner("a", true), banner("b", false)]);
        await new UnblockBannerUseCase(repo).execute("b");
        assert.deepEqual(live(repo), ["b"]);
    });

    it("turning the live banner off leaves none live", async () => {
        const repo = new FakeBannerRepository([banner("a", true), banner("b", false)]);
        await new BlockBannerUseCase(repo).execute("a");
        assert.deepEqual(live(repo), []);
    });

    it("the storefront gets only the newest live banner, even if old data has several on", async () => {
        const repo = new FakeBannerRepository([banner("old", true), banner("new", true)]);
        const shown = await new GetBannerUserUseCase(repo).execute();
        assert.deepEqual(
            shown.map((b) => b.id),
            ["new"]
        );
    });

    it("editing keeps the banner's live state and link", async () => {
        const repo = new FakeBannerRepository([banner("a", true)]);
        await new EditBannerUseCase(repo).execute("a", { image: image("img-a"), buttonUrl: "/products" });
        assert.equal(repo.rows[0]?.isActive, true);
        assert.equal(repo.rows[0]?.buttonUrl, "/products");
        assert.equal(await statusOf(new EditBannerUseCase(repo).execute("missing", { image: image("x") })), 404);
    });
});
