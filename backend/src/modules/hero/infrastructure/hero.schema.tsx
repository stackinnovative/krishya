import { Schema, model, Document } from "mongoose";

export interface IHero extends Document {
    label?: string;
    title: string;
    subtitle: string;
    image: {
        url: string;
        publicId: string;
    };
    buttonLabel?: string;
    buttonUrl?: string;
    secondaryLabel?: string;
    secondaryUrl?: string;
    badgeText?: string;
    spotlightProductId?: string;
    spotlightLabel?: string;
    priority?: number;
    isActive: boolean;
}

const heroSchema = new Schema<IHero>(
    {
        label: {
            type: String,
            trim: true,
            default: "",
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        subtitle: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            url: {
                type: String,
                required: true,
            },
            publicId: {
                type: String,
                required: true,
            },
        },
        buttonLabel: {
            type: String,
            trim: true,
            default: "",
        },
        buttonUrl: {
            type: String,
            trim: true,
            default: "",
        },
        secondaryLabel: { type: String, trim: true, default: "" },
        secondaryUrl: { type: String, trim: true, default: "" },
        badgeText: { type: String, trim: true, default: "" },
        spotlightProductId: { type: String, trim: true, default: "" },
        spotlightLabel: { type: String, trim: true, default: "" },
        priority: {
            type: Number,
            default: 0,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

export const HeroModel = model<IHero>("Hero", heroSchema);