import "reflect-metadata";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { About } from "../entities/about.entity.js";
import type { IAboutRepository } from "../repositories/about.repository.interface.js";
import { UpdateAboutUseCase } from "../use-cases/update.about.use-case.js";
import { aboutInput, image } from "./about.fixtures.js";

/** In-memory repository holding the singleton. */
class FakeAboutRepository implements IAboutRepository {
    saves = 0;
    failNextSave = false;
    constructor(public stored: About) { }
    async getAbout() {
        return this.stored;
    }
    async updateAbout(entity: About) {
        if (this.failNextSave) throw new Error("db down");
        this.saves++;
        this.stored = entity;
        return entity;
    }
}

/** Records deletions instead of calling Cloudinary; can simulate a failure. */
class TestUpdateAboutUseCase extends UpdateAboutUseCase {
    removed: string[] = [];
    failRemoval = false;
    protected override async removeImage(publicId: string) {
        if (this.failRemoval) throw new Error("cloudinary down");
        this.removed.push(publicId);
    }
}

const storedWith = (teaserImage: string, tribute: string | null) => {
    const input = aboutInput();
    input.teaser.image = image(teaserImage);
    input.tribute.image = tribute ? image(tribute) : null;
    return new About({ id: "a1", ...input });
};

describe("UpdateAboutUseCase", () => {
    it("saves the new content and returns it as a view", async () => {
        const repo = new FakeAboutRepository(storedWith("teaser-1", null));
        const useCase = new TestUpdateAboutUseCase(repo);
        const dto = aboutInput();
        dto.teaser.image = image("teaser-1");
        dto.header.title = "A new title";

        const view = await useCase.execute(dto);

        assert.equal(repo.saves, 1);
        assert.equal(view.id, "a1");
        assert.equal(view.header.title, "A new title");
        assert.deepEqual(useCase.removed, []);
    });

    it("deletes photos that were replaced or removed, keeps the rest", async () => {
        const repo = new FakeAboutRepository(storedWith("teaser-old", "tribute-old"));
        const useCase = new TestUpdateAboutUseCase(repo);
        const dto = aboutInput();
        dto.teaser.image = image("teaser-new");
        dto.tribute.image = null;

        await useCase.execute(dto);

        assert.deepEqual(useCase.removed.sort(), ["teaser-old", "tribute-old"]);
    });

    it("still succeeds when a photo can't be deleted", async () => {
        const repo = new FakeAboutRepository(storedWith("teaser-old", null));
        const useCase = new TestUpdateAboutUseCase(repo);
        useCase.failRemoval = true;
        const dto = aboutInput();
        dto.teaser.image = image("teaser-new");

        const view = await useCase.execute(dto);

        assert.deepEqual(view.teaser.image, image("teaser-new"));
        assert.equal(repo.saves, 1);
    });

    it("deletes nothing when the save fails", async () => {
        const repo = new FakeAboutRepository(storedWith("teaser-old", null));
        repo.failNextSave = true;
        const useCase = new TestUpdateAboutUseCase(repo);
        const dto = aboutInput();
        dto.teaser.image = image("teaser-new");

        await assert.rejects(useCase.execute(dto), /db down/);
        assert.deepEqual(useCase.removed, []);
    });

    it("rejects invalid content before touching the database", async () => {
        const repo = new FakeAboutRepository(storedWith("teaser-1", null));
        const useCase = new TestUpdateAboutUseCase(repo);
        const dto = aboutInput();
        dto.story.paragraphs = [];

        await assert.rejects(useCase.execute(dto), /between 1 and 8 paragraphs/);
        assert.equal(repo.saves, 0);
    });
});
