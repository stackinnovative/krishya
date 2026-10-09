import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { About } from "../entities/about.entity.js";
import { aboutInput, image } from "./about.fixtures.js";

describe("About entity", () => {
    it("builds from the default content", () => {
        const about = new About({ id: "a1", ...aboutInput() });
        assert.equal(about.story.paragraphs.length, 6);
        assert.equal(about.teaser.showOnHome, true);
    });

    it("drops blank paragraphs and trims the rest", () => {
        const input = aboutInput();
        input.story.paragraphs = ["  First.  ", "", "   ", "Second."];
        const about = new About({ id: "a1", ...input });
        assert.deepEqual(about.story.paragraphs, ["First.", "Second."]);
    });

    it("refuses a story with no paragraphs left", () => {
        const input = aboutInput();
        input.story.paragraphs = ["  "];
        assert.throws(() => new About({ id: "a1", ...input }), /between 1 and 8 paragraphs/);
    });

    it("refuses text over its limit", () => {
        const input = aboutInput();
        input.header.title = "x".repeat(101);
        assert.throws(() => new About({ id: "a1", ...input }), /page title cannot exceed 100/);
    });

    it("refuses a stat with only one half filled in", () => {
        const input = aboutInput();
        input.stat.value = "";
        assert.throws(() => new About({ id: "a1", ...input }), /both a value and a label/);
    });

    it("lists only the photos the new content no longer uses", () => {
        const before = aboutInput();
        before.teaser.image = image("teaser-old");
        before.header.image = image("header-kept");
        before.tribute.image = image("tribute-removed");

        const after = aboutInput();
        after.teaser.image = image("teaser-new");
        after.header.image = image("header-kept");
        after.tribute.image = null;

        const replaced = new About({ id: "a1", ...before }).replacedImageIds(new About({ id: "a1", ...after }));
        assert.deepEqual(replaced.sort(), ["teaser-old", "tribute-removed"]);
    });
});
