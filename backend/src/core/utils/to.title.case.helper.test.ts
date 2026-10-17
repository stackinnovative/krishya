import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toTitleCase } from "./to.title.case.helper.js";

describe("toTitleCase", () => {
    it("fixes all-caps and all-lowercase names", () => {
        assert.equal(toTitleCase("NEELIBRINGADI"), "Neelibringadi");
        assert.equal(toTitleCase("hair care"), "Hair Care");
    });

    it("keeps joining words lowercase except at the start", () => {
        assert.equal(toTitleCase("oil FOR the hair"), "Oil for the Hair");
        assert.equal(toTitleCase("the classic oil"), "The Classic Oil");
    });

    it("handles symbols, hyphens, apostrophes and sizes", () => {
        assert.equal(toTitleCase("joint & muscle care"), "Joint & Muscle Care");
        assert.equal(toTitleCase("anti-dandruff oil"), "Anti-Dandruff Oil");
        assert.equal(toTitleCase("WOMEN'S wellness"), "Women's Wellness");
        assert.equal(toTitleCase("mahanarayana oil 200ML"), "Mahanarayana Oil 200ml");
    });

    it("trims and collapses spaces", () => {
        assert.equal(toTitleCase("  kshirabala   thailam "), "Kshirabala Thailam");
    });
});
