import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UpdateAboutSchema } from "../dtos/about.dto.js";
import { aboutInput, image } from "./about.fixtures.js";

const errorsOf = (input: unknown) => {
    const result = UpdateAboutSchema.safeParse(input);
    return result.success ? {} : Object.fromEntries(result.error.issues.map((i) => [i.path.join("."), i.message]));
};

describe("UpdateAboutSchema", () => {
    it("accepts the default content", () => {
        assert.equal(UpdateAboutSchema.safeParse(aboutInput()).success, true);
    });

    it("accepts uploaded images and trims text", () => {
        const input = aboutInput();
        input.teaser.image = image("teaser");
        input.teaser.title = "  Our heritage  ";
        const parsed = UpdateAboutSchema.parse(input);
        assert.equal(parsed.teaser.title, "Our heritage");
        assert.deepEqual(parsed.teaser.image, image("teaser"));
    });

    it("reports an empty paragraph at its exact path", () => {
        const input = aboutInput();
        input.story.paragraphs[1] = "   ";
        assert.equal(errorsOf(input)["story.paragraphs.1"], "Paragraph is required");
    });

    it("limits the story to 8 paragraphs and requires at least one", () => {
        const many = aboutInput();
        many.story.paragraphs = Array.from({ length: 9 }, (_, i) => `Paragraph ${i + 1}`);
        assert.match(errorsOf(many)["story.paragraphs"] ?? "", /at most 8/);

        const none = aboutInput();
        none.story.paragraphs = [];
        assert.equal(errorsOf(none)["story.paragraphs"], "Add at least one story paragraph");
    });

    it("keeps the home summary between 20 and 300 characters", () => {
        const short = aboutInput();
        short.teaser.summary = "Too short";
        assert.match(errorsOf(short)["teaser.summary"] ?? "", /at least 20/);

        const long = aboutInput();
        long.teaser.summary = "x".repeat(301);
        assert.match(errorsOf(long)["teaser.summary"] ?? "", /cannot exceed 300/);
    });

    it("requires the stat value and label together", () => {
        const input = aboutInput();
        input.stat.label = "";
        assert.equal(errorsOf(input)["stat.label"], "Add a label for the stat, or clear its value");

        const both = aboutInput();
        both.stat = { value: "", label: "" };
        assert.equal(UpdateAboutSchema.safeParse(both).success, true);
    });

    it("rejects an image without a valid url", () => {
        const input = aboutInput();
        input.header.image = { url: "not-a-url", publicId: "x" };
        assert.equal(errorsOf(input)["header.image.url"], "Valid image URL is required");
    });

    it("checks each craft photo and caption at its own path", () => {
        const input = aboutInput();
        input.craft.items = [{ image: image("craft-1"), caption: "  " }];
        assert.equal(errorsOf(input)["craft.items.0.caption"], "Caption is required");

        const many = aboutInput();
        many.craft.items = Array.from({ length: 7 }, (_, i) => ({ image: image(`craft-${i}`), caption: "Step" }));
        assert.match(errorsOf(many)["craft.items"] ?? "", /at most 6/);
    });

    it("needs a photo on every craft item", () => {
        const input = { ...aboutInput(), craft: { heading: "The traditional way", items: [{ image: null, caption: "Step" }] } };
        assert.ok(errorsOf(input)["craft.items.0.image"]);
    });
});
