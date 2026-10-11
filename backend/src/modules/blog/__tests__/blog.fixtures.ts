import type { CreateBlogRequestDto } from "../dtos/blog.dto.js";
import type { BlogProps, IImage } from "../types/blog.type.js";

export const image = (publicId: string): IImage => ({ url: `https://res.cloudinary.com/demo/image/upload/${publicId}.jpg`, publicId });

export const PRODUCT_A = "64b000000000000000000001";
export const PRODUCT_B = "64b000000000000000000002";

/** A valid draft article; tests tweak the copy they need. */
export const blogInput = (): Omit<BlogProps, "id"> => ({
    title: "Karkidakam: Preparing for the Monsoon",
    slug: "",
    category: "Seasonal Care",
    excerpt: "Why Karkidakam has long been set aside for rest and warm oil massage.",
    coverImage: image("cover"),
    blocks: [
        { type: "paragraph", text: "In Kerala, the monsoon month is a time to slow down." },
        { type: "heading", text: "What the tradition suggests" },
        { type: "list", items: ["Warm water in the morning", "Early nights"] },
        { type: "quote", text: "Small, steady habits are the heart of Ayurvedic living." },
        { type: "image", image: image("inline"), caption: "Herbs drying in the sun" },
        { type: "products", productIds: [PRODUCT_A] },
    ],
    isFeatured: false,
    status: "draft",
    publishedAt: null,
    seoTitle: "",
    seoDescription: "",
});

/** The same article as a create/edit request body after parsing. */
export const blogDto = (overrides: Partial<CreateBlogRequestDto> = {}): CreateBlogRequestDto => {
    const { title, slug, category, excerpt, coverImage, blocks } = blogInput();
    return {
        title,
        slug,
        category,
        excerpt,
        coverImage,
        blocks,
        isFeatured: false,
        status: "draft",
        seoTitle: "",
        seoDescription: "",
        ...overrides,
    };
};
