import { Schema, model, Document } from "mongoose";

export interface ITestimonial extends Document {
    comment: string;
    author: string;
    isActive: boolean;
}

const testimonialSchema = new Schema<ITestimonial>(
    {
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
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

export const TestimonialModel = model<ITestimonial>("Testimonial", testimonialSchema);