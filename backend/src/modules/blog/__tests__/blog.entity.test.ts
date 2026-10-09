import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Blog, resolvePublishedAt, toSlug } from "../entities/blog.entity.js";
import { blogInput, image, PRODUCT_A, PRODUCT_B } from "./blog.fixtures.js";

const NOW = new Date("2026-10-09T10:00:00.000Z");

describe("toSlug", () => {
    it("makes a clean lowercase URL from any title", () => {
        assert.equal(toSlug("Karkidakam: Preparing for the Monsoon!"), "karkidakam-preparing-for-the-monsoon");
        assert.equal(toSlug("  Ayurvéda -- Basics  "), "ayurveda-basics");
        assert.equal(toSlug("!!!"), "");
    });
});

describe("Blog entity", () => {
    it("takes its slug from the title when none is given", () => {
        const blog = new Blog({ id: "b1", ...blogInput() });
        assert.equal(blog.slug, "karkidakam-preparing-for-the-monsoon");
        assert.equal(new Blog({ ...blogInput(), slug: "My Custom URL" }).slug, "my-custom-url");
    });

    it("trims list items and drops empty ones", () => {
        const input = blogInput();
        input.blocks = [{ type: "list", items: ["  One  ", "", "Two"] }];
        assert.deepEqual(new Blog(input).blocks, [{ type: "list", items: ["One", "Two"] }]);
    });

    it("counts reading time from the text, at least one minute", () => {
        assert.equal(new Blog(blogInput()).readMinutes, 1);
        const long = blogInput();
        long.blocks = [{ type: "paragraph", text: Array.from({ length: 450 }, () => "word").join(" ") }];
        assert.equal(new Blog(long).readMinutes, 3);
    });

    it("lists each mentioned product once, in order", () => {
        const input = blogInput();
        input.blocks = [
            { type: "products", productIds: [PRODUCT_B, PRODUCT_A] },
            { type: "paragraph", text: "Between." },
            { type: "products", productIds: [PRODUCT_A] },
        ];
        assert.deepEqual(new Blog(input).productIds, [PRODUCT_B, PRODUCT_A]);
    });

    it("refuses to publish without a cover photo", () => {
        const draft = new Blog({ id: "b1", ...blogInput(), coverImage: null });
        assert.throws(() => draft.publish(NOW), /cover photo/);
    });

    it("publishes now unless it already had a date, and unpublishing keeps the date", () => {
        const published = new Blog({ id: "b1", ...blogInput() }).publish(NOW);
        assert.equal(published.status, "published");
        assert.equal(published.publishedAt?.toISOString(), NOW.toISOString());

        const draft = published.unpublish();
        assert.equal(draft.status, "draft");
        assert.equal(draft.publishedAt?.toISOString(), NOW.toISOString());
        assert.throws(() => draft.unpublish(), /already a draft/);
    });

    it("lists only the photos the edited article no longer uses", () => {
        const before = new Blog({ id: "b1", ...blogInput() });
        const afterInput = blogInput();
        afterInput.coverImage = image("cover-new");
        afterInput.blocks = afterInput.blocks.filter((b) => b.type !== "image");
        const after = new Blog({ id: "b1", ...afterInput });
        assert.deepEqual(before.replacedImageIds(after).sort(), ["cover", "inline"]);
    });
});

describe("resolvePublishedAt", () => {
    const earlier = new Date("2026-01-01T00:00:00.000Z");
    const chosen = new Date("2026-12-25T00:00:00.000Z");

    it("uses the admin's date, else keeps the original, else now", () => {
        assert.equal(resolvePublishedAt("published", chosen, earlier, NOW), chosen);
        assert.equal(resolvePublishedAt("published", undefined, earlier, NOW), earlier);
        assert.equal(resolvePublishedAt("published", null, null, NOW), NOW);
    });

    it("lets a draft keep or clear its date", () => {
        assert.equal(resolvePublishedAt("draft", undefined, earlier, NOW), earlier);
        assert.equal(resolvePublishedAt("draft", null, earlier, NOW), null);
    });
});
