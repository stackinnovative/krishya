import { z } from "zod";
import { BLOG_CATEGORIES, BLOG_LIMITS as L, BLOG_STATUSES } from "../types/blog.type.js";

export const BlogImageSchema = z.object({
    url: z.string().url("Valid image URL is required"),
    publicId: z.string().min(1, "Image public ID is required"),
});

const text = (name: string, max: number, min = 0) =>
    z
        .string()
        .trim()
        .min(min, min === 1 ? `${name} is required` : `${name} must be at least ${min} characters`)
        .max(max, `${name} cannot exceed ${max} characters`);

const ObjectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid product");

/** One schema per block type; `type` picks which one applies, so errors land on the right field (e.g. "blocks.3.text"). */
const BlogBlockSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("paragraph"), text: text("Paragraph", L.paragraph, 1) }),
    z.object({ type: z.literal("heading"), text: text("Heading", L.heading, 1) }),
    z.object({ type: z.literal("quote"), text: text("Quote", L.quote, 1) }),
    z.object({
        type: z.literal("list"),
        items: z
            .array(text("List item", L.listItem, 1))
            .min(1, "Add at least one list item")
            .max(L.listItemsMax, `A list can have at most ${L.listItemsMax} items`),
    }),
    z.object({
        type: z.literal("image"),
        image: BlogImageSchema,
        caption: text("Caption", L.caption),
    }),
    z.object({
        type: z.literal("products"),
        productIds: z
            .array(ObjectIdSchema)
            .min(1, "Pick at least one product")
            .max(L.productsPerBlockMax, `Pick at most ${L.productsPerBlockMax} products`),
    }),
]);

export const CreateBlogSchema = z
    .object({
        title: text("Title", L.title, 1),
        slug: text("URL", L.slug).optional().default(""),
        category: z.enum(BLOG_CATEGORIES, { message: "Choose a category" }),
        excerpt: text("Summary", L.excerpt, L.excerptMin),
        coverImage: BlogImageSchema.nullable(),
        blocks: z
            .array(BlogBlockSchema)
            .min(L.blocksMin, "Add at least one content block")
            .max(L.blocksMax, `An article can have at most ${L.blocksMax} blocks`),
        isFeatured: z.boolean().optional().default(false),
        status: z.enum(BLOG_STATUSES).optional().default("draft"),
        /** ISO date; leave out or null to publish "now" when the article goes live. */
        publishedAt: z.iso.datetime({ offset: true, message: "Invalid publish date" }).nullable().optional(),
        seoTitle: text("SEO title", L.seoTitle).optional().default(""),
        seoDescription: text("SEO description", L.seoDescription).optional().default(""),
    })
    .superRefine((v, ctx) => {
        if (v.status === "published" && !v.coverImage) {
            ctx.addIssue({ code: "custom", path: ["coverImage"], message: "Add a cover photo before publishing" });
        }
    });

export type CreateBlogRequestDto = z.infer<typeof CreateBlogSchema>;

export const EditBlogSchema = CreateBlogSchema;

export type EditBlogRequestDto = z.infer<typeof EditBlogSchema>;
