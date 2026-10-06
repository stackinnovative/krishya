import { Schema, model, Document } from "mongoose";

export interface IBanner extends Document {
    image: {
        url: string;
        publicId: string;
    };
    buttonUrl?: string;
    isActive: boolean;
}

const bannerSchema = new Schema<IBanner>(
    {
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
        buttonUrl: {
            type: String,
            trim: true,
            default: "",
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

export const BannerModel = model<IBanner>("Banner", bannerSchema);