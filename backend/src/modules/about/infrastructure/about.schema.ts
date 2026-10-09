import { Schema, model, Document } from "mongoose";
import { ABOUT_DEFAULTS } from "../entities/about.entity.js";

type IImageDoc = { url: string; publicId: string } | null;

export interface IAbout extends Document {
    teaser: { eyebrow: string; title: string; summary: string; image: IImageDoc; linkLabel: string; showOnHome: boolean };
    header: { eyebrow: string; title: string; subtitle: string; image: IImageDoc };
    story: { heading: string; paragraphs: string[]; closing: string };
    stat: { value: string; label: string };
    tribute: { image: IImageDoc; quote: string; name: string; role: string };
}

/** A nullable Cloudinary image (null = storefront falls back to its bundled photo). */
const imageField = () => ({
    type: new Schema({ url: { type: String, required: true }, publicId: { type: String, required: true } }, { _id: false }),
    default: null,
});

const D = ABOUT_DEFAULTS;

const aboutSchema = new Schema<IAbout>(
    {
        teaser: {
            eyebrow: { type: String, trim: true, default: D.teaser.eyebrow },
            title: { type: String, trim: true, default: D.teaser.title },
            summary: { type: String, trim: true, default: D.teaser.summary },
            image: imageField(),
            linkLabel: { type: String, trim: true, default: D.teaser.linkLabel },
            showOnHome: { type: Boolean, default: D.teaser.showOnHome },
        },
        header: {
            eyebrow: { type: String, trim: true, default: D.header.eyebrow },
            title: { type: String, trim: true, default: D.header.title },
            subtitle: { type: String, trim: true, default: D.header.subtitle },
            image: imageField(),
        },
        story: {
            heading: { type: String, trim: true, default: D.story.heading },
            paragraphs: { type: [String], default: D.story.paragraphs },
            closing: { type: String, trim: true, default: D.story.closing },
        },
        stat: {
            value: { type: String, trim: true, default: D.stat.value },
            label: { type: String, trim: true, default: D.stat.label },
        },
        tribute: {
            image: imageField(),
            quote: { type: String, trim: true, default: D.tribute.quote },
            name: { type: String, trim: true, default: D.tribute.name },
            role: { type: String, trim: true, default: D.tribute.role },
        },
    },
    {
        timestamps: true,
    }
);

// Singleton - every write targets the same (only) document, like business settings.
export const AboutModel = model<IAbout>("About", aboutSchema);
