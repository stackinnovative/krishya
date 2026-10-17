import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Product, type ProductProps } from "../entities/product.entity.js";
import { calcDiscountPercent, formatVariantLabel, hasDuplicateVariantSizes } from "../utils/variant.helper.js";

const props = (overrides: Partial<ProductProps> = {}): ProductProps => ({
    id: null,
    name: "Nalpamaradi Skincare Oil",
    slug: "nalpamaradi-skincare-oil",
    category: "64b000000000000000000001",
    type: "thailam",
    shortDescription: "A timeless Ayurvedic skincare ritual.",
    description: "A traditional Ayurvedic oil presented for mindful skincare routines.",
    images: [{ url: "https://res.cloudinary.com/x/nalpamaradi.jpg", publicId: "nalpamaradi" }],
    variants: [{ quantity: 200, unit: "ml", mrp: 260, price: 199, stock: 10 }],
    ...overrides,
});

describe("calcDiscountPercent", () => {
    it("rounds down so the shown discount is never bigger than the real one", () => {
        assert.equal(calcDiscountPercent(260, 199), 23); // 23.46%
        assert.equal(calcDiscountPercent(300, 210), 30); // float noise must not drop it to 29
        assert.equal(calcDiscountPercent(100, 50), 50);
    });

    it("is 0 when there is no discount", () => {
        assert.equal(calcDiscountPercent(220, 220), 0);
        assert.equal(calcDiscountPercent(0, 10), 0);
    });
});

describe("variant helpers", () => {
    it("labels a variant by quantity and unit", () => {
        assert.equal(formatVariantLabel({ quantity: 200, unit: "ml" }), "200 ml");
        assert.equal(formatVariantLabel({ quantity: 60, unit: "tablets" }), "60 tablets");
    });

    it("treats the same quantity in a different unit as a different variant", () => {
        assert.equal(hasDuplicateVariantSizes([{ quantity: 100, unit: "ml" }, { quantity: 100, unit: "g" }]), false);
        assert.equal(hasDuplicateVariantSizes([{ quantity: 100, unit: "ml" }, { quantity: 100, unit: "ml" }]), true);
    });
});

describe("Product entity", () => {
    it("calculates each variant's discount and ignores one passed in", () => {
        const product = new Product(props({ variants: [{ quantity: 200, unit: "ml", mrp: 260, price: 199, discountPercent: 90, stock: 5 }] }));
        assert.equal(product.variants[0]?.discountPercent, 23);
    });

    it("refuses a price above the MRP", () => {
        assert.throws(() => new Product(props({ variants: [{ quantity: 200, unit: "ml", mrp: 200, price: 220, stock: 1 }] })), /MRP/);
    });

    it("refuses two variants of the same quantity and unit", () => {
        const twice = { quantity: 200, unit: "ml" as const, mrp: 260, price: 260, stock: 1 };
        assert.throws(() => new Product(props({ variants: [twice, { ...twice, price: 240 }] })), /same quantity/);
    });

    it("needs 1 to 5 photos", () => {
        assert.throws(() => new Product(props({ images: [] })), /photos/);
        const photo = { url: "https://res.cloudinary.com/x/a.jpg", publicId: "a" };
        assert.throws(() => new Product(props({ images: Array(6).fill(photo) })), /photos/);
    });

    it("keeps the optional tabs empty when not given", () => {
        const product = new Product(props());
        assert.deepEqual([product.ingredients, product.howToUse, product.storage, product.badge], [[], "", "", ""]);
    });

    it("keeps the slug when details are edited", () => {
        const renamed = new Product(props()).updateDetails({ ...props(), name: "Nalpamaradi Oil" });
        assert.equal(renamed.name, "Nalpamaradi Oil");
        assert.equal(renamed.slug, "nalpamaradi-skincare-oil");
    });
});
