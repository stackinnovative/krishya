import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ABOUT_DEFAULTS } from "../entities/about.entity.js";
import { AboutMapper } from "../mappers/about.mapper.js";
import { image } from "./about.fixtures.js";

describe("AboutMapper", () => {
    it("returns null without a record or an id", () => {
        assert.equal(AboutMapper.toDomain(null), null);
        assert.equal(AboutMapper.toDomain({ teaser: {} }), null);
    });

    it("fills every missing block with the default content (a document older than the field)", () => {
        const about = AboutMapper.toDomain({ _id: "a1", teaser: { title: "Saved title" } })!;
        assert.equal(about.teaser.title, "Saved title");
        assert.equal(about.teaser.summary, ABOUT_DEFAULTS.teaser.summary);
        assert.deepEqual(about.story.paragraphs, ABOUT_DEFAULTS.story.paragraphs);
        assert.deepEqual(about.stat, ABOUT_DEFAULTS.stat);
    });

    it("treats an incomplete stored image as no image", () => {
        const about = AboutMapper.toDomain({ _id: "a1", header: { image: { url: "https://x/y.jpg" } }, tribute: { image: image("t") } })!;
        assert.equal(about.header.image, null);
        assert.deepEqual(about.tribute.image, image("t"));
    });

    it("backfills the craft row and drops a stored craft item without a photo", () => {
        const empty = AboutMapper.toDomain({ _id: "a1" })!;
        assert.deepEqual(empty.craft, ABOUT_DEFAULTS.craft);

        const about = AboutMapper.toDomain({
            _id: "a1",
            craft: { items: [{ image: image("c1"), caption: "Sorting herbs" }, { caption: "No photo" }] },
        })!;
        assert.equal(about.craft.heading, ABOUT_DEFAULTS.craft.heading);
        assert.deepEqual(about.craft.items, [{ image: image("c1"), caption: "Sorting herbs" }]);
    });

    it("round-trips through persistence and view", () => {
        const about = AboutMapper.toDomain({ _id: "a1" })!;
        const view = AboutMapper.toView(about);
        assert.equal(view.id, "a1");
        assert.deepEqual(AboutMapper.toPersistence(about), { teaser: view.teaser, header: view.header, story: view.story, stat: view.stat, tribute: view.tribute, craft: view.craft });
    });
});
