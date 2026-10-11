import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CreateBlogSchema } from "../dtos/blog.dto.js";
import { blogDto } from "./blog.fixtures.js";

const errorsOf = (input: unknown) => {
    const result = CreateBlogSchema.safeParse(input);
    return result.success ? {} : Object.fromEntries(result.error.issues.map((i) => [i.path.join("."), i.message]));
};

describe("CreateBlogSchema", () => {
    it("accepts a full article and fills the optional fields", () => {
        const { title, category, excerpt, coverImage, blocks } = blogDto();
        const parsed = CreateBlogSchema.parse({ title, category, excerpt, coverImage, blocks });
        assert.equal(parsed.slug, "");
        assert.equal(parsed.status, "draft");
        assert.equal(parsed.isFeatured, false);
    });

    it("reports a block error at the block's own path", () => {
        const input = blogDto();
        input.blocks = [{ type: "paragraph", text: "Fine." }, { type: "heading", text: "   " }];
        assert.equal(errorsOf(input)["blocks.1.text"], "Heading is required");
    });

    it("rejects an unknown block type and a products block with a bad id", () => {
        assert.ok(errorsOf({ ...blogDto(), blocks: [{ type: "video", url: "x" }] })["blocks.0.type"]);
        assert.equal(errorsOf({ ...blogDto(), blocks: [{ type: "products", productIds: ["nope"] }] })["blocks.0.productIds.0"], "Invalid product");
    });

    it("needs at least one block and a known category", () => {
        assert.equal(errorsOf({ ...blogDto(), blocks: [] })["blocks"], "Add at least one content block");
        assert.equal(errorsOf({ ...blogDto(), category: "Recipes" })["category"], "Choose a category");
    });

    it("requires a cover photo only when publishing", () => {
        assert.equal(CreateBlogSchema.safeParse(blogDto({ coverImage: null })).success, true);
        assert.equal(errorsOf(blogDto({ coverImage: null, status: "published" }))["coverImage"], "Add a cover photo before publishing");
    });

    it("keeps the summary between 20 and 300 characters", () => {
        assert.match(errorsOf(blogDto({ excerpt: "Too short" }))["excerpt"] ?? "", /at least 20/);
        assert.match(errorsOf(blogDto({ excerpt: "x".repeat(301) }))["excerpt"] ?? "", /cannot exceed 300/);
    });

    it("accepts an ISO publish date and rejects anything else", () => {
        assert.equal(CreateBlogSchema.safeParse(blogDto({ publishedAt: "2026-10-01T09:00:00.000Z" })).success, true);
        assert.equal(errorsOf(blogDto({ publishedAt: "next tuesday" }))["publishedAt"], "Invalid publish date");
    });
});
