import { Schema, model, Document, Types } from "mongoose";

export interface IFaqGroup extends Document {
    name: string;
    order: number;
    isActive: boolean;
}

export interface IFaq extends Document {
    question: string;
    answer: string;
    group: Types.ObjectId;
    order: number;
    isActive: boolean;
    showOnHome: boolean;
}

const faqGroupSchema = new Schema<IFaqGroup>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const faqSchema = new Schema<IFaq>(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },
        answer: {
            type: String,
            required: true,
            trim: true,
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: "FaqGroup",
            required: true,
            index: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        showOnHome: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * One document, written the first time FAQs are read: marks that the starter
 * questions were loaded, so they're never loaded again - even after the
 * admin deletes every question.
 */
const faqSeedSchema = new Schema<{ _id: string; seededAt: Date }>({
    _id: { type: String, required: true },
    seededAt: { type: Date, required: true },
});

export const FaqGroupModel = model<IFaqGroup>("FaqGroup", faqGroupSchema);
export const FaqModel = model<IFaq>("Faq", faqSchema);
export const FaqSeedModel = model("FaqSeed", faqSeedSchema);
