import { z } from "zod";

export const CreateTestimonialSchema = z.object({
    comment: z
        .string()
        .min(5, "Comment must be at least 5 characters")
        .max(500, "Comment cannot exceed 500 characters"),
    author: z
        .string()
        .min(2, "Author must be at least 2 characters")
        .max(100, "Author cannot exceed 100 characters"),
});

export type CreateTestimonialRequestDto = z.infer<typeof CreateTestimonialSchema>;

export const EditTestimonialSchema = CreateTestimonialSchema;

export type EditTestimonialRequestDto = z.infer<typeof EditTestimonialSchema>;
