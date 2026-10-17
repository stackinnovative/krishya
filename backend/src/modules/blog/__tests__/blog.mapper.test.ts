import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Blog } from "../entities/blog.entity.js";
import { BlogMapper } from "../mappers/blog.mapper.js";
import { blogInput, PRODUCT_A, PRODUCT_B } from "./blog.fixtures.js";

const product = (id: string, name: string) => ({ id, name, slug: name, price: 240, image: `https://x/${name}.jpg` });

describe("BlogMapper", () => {
    it("returns null for a missing record, an id-less record, or one that fails validation", () => {
        assert.equal(BlogMapper.toDomain(null), null);
        assert.equal(BlogMapper.toDomain(blogInput()), null);
        assert.equal(BlogMapper.toDomain({ _id: "b1", ...blogInput(), blocks: [] }), null);
    });

    it("round-trips an article through persistence", () => {
        const blog = new Blog({ id: "b1", ...blogInput() });
        const stored = { _id: "b1", ...BlogMapper.toPersistence(blog) };
        const back = BlogMapper.toDomain(stored)!;
        assert.deepEqual(back.blocks, blog.blocks);
        assert.equal(stored.readMinutes, blog.readMinutes);
    });

    it("resolves product blocks to live products and drops a block left empty", () => {
        const input = blogInput();
        input.blocks = [
            { type: "paragraph", text: "Intro." },
            { type: "products", productIds: [PRODUCT_B, PRODUCT_A] },
            { type: "products", productIds: ["64b0000000000000000000ff"] },
        ];
        const view = BlogMapper.toUserView(new Blog({ id: "b1", ...input }), [product(PRODUCT_A, "a"), product(PRODUCT_B, "b")], []);
        assert.equal(view.blocks.length, 2);
        const block = view.blocks[1];
        assert.ok(block?.type === "products");
        assert.deepEqual(
            block.products.map((p) => p.id),
            [PRODUCT_B, PRODUCT_A]
        );
    });

    it("builds a card from a list record without a body", () => {
        const { title, slug, category, excerpt, coverImage } = blogInput();
        const card = BlogMapper.toListView({ _id: "b1", title, slug, category, excerpt, coverImage, readMinutes: 4, publishedAt: new Date("2026-10-01T00:00:00.000Z") });
        assert.equal(card?.readMinutes, 4);
        assert.equal(card?.publishedAt, "2026-10-01T00:00:00.000Z");
    });
});
