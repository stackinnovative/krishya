import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Category } from "../entities/category.entity.js";
import type { CategoryProps } from "../types/category.type.js";

const props = (overrides: Partial<CategoryProps> = {}): CategoryProps => ({
    id: null,
    name: "Hair Care",
    slug: "hair-care",
    description: "Oils and packs for scalp and hair rituals.",
    icon: "Sprout",
    ...overrides,
});

describe("Category entity", () => {
    it("defaults sort order to 0 and keeps it active", () => {
        const category = new Category(props());
        assert.equal(category.sortOrder, 0);
        assert.equal(category.isActive, true);
    });

    it("cleans the slug it is given", () => {
        assert.equal(new Category(props({ slug: "  Hair Care! " })).slug, "hair-care");
    });

    it("refuses a slug with no letters or numbers", () => {
        assert.throws(() => new Category(props({ slug: "!!!" })), /slug/);
    });

    it("refuses an icon outside the allow-list", () => {
        assert.throws(() => new Category(props({ icon: "Rocket" as CategoryProps["icon"] })), /icon/);
    });

    it("refuses a negative or fractional sort order", () => {
        assert.throws(() => new Category(props({ sortOrder: -1 })), /sort order/);
        assert.throws(() => new Category(props({ sortOrder: 1.5 })), /sort order/);
    });

    it("keeps slug, icon and sort order through block and unblock", () => {
        const blocked = new Category(props({ sortOrder: 3 })).deactivate();
        assert.equal(blocked.isActive, false);
        const restored = blocked.activate();
        assert.deepEqual(
            { slug: restored.slug, icon: restored.icon, sortOrder: restored.sortOrder },
            { slug: "hair-care", icon: "Sprout", sortOrder: 3 },
        );
    });
});
