import { Schema, model, Document } from "mongoose";
import { BLOG_CATEGORIES, BLOG_STATUSES, type BlogBlock, type BlogCategory, type BlogStatus } from "../types/blog.type.js";

export interface IBlog extends Document {
    title: string;
    slug: string;
    category: BlogCategory;
    excerpt: string;
    coverImage: { url: string; publicId: string } | null;
    blocks: BlogBlock[];
    /** Stored so list queries don't need to load the body to show "N min read". */
    readMinutes: number;
    isFeatured: boolean;
    status: BlogStatus;
    publishedAt: Date | null;
    seoTitle: string;
    seoDescription: string;
    createdAt: Date;
    updatedAt: Date;
}

const imageSchema = new Schema(
    {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
    },
    { _id: false }
);

const blogSchema = new Schema<IBlog>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
        },
        category: {
            type: String,
            enum: BLOG_CATEGORIES,
            required: true,
            index: true,
        },
        excerpt: {
            type: String,
            required: true,
            trim: true,
        },
        coverImage: {
            type: imageSchema,
            default: null,
        },
        // Blocks are a tagged union validated by the entity - stored as a plain array.
        blocks: {
            type: Schema.Types.Mixed,
            default: () => [],
        },
        readMinutes: {
            type: Number,
            default: 1,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: BLOG_STATUSES,
            default: "draft",
        },
        publishedAt: {
            type: Date,
            default: null,
        },
        seoTitle: {
            type: String,
            trim: true,
            default: "",
        },
        seoDescription: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// The storefront always asks for "published, newest first".
blogSchema.index({ status: 1, publishedAt: -1 });

export const BlogModel = model<IBlog>("Blog", blogSchema);
