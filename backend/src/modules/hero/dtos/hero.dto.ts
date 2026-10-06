import { z } from "zod";

export const HeroImageSchema = z.object({
    url: z.string().url("Valid image URL is required"),
    publicId: z.string().min(1, "Image public ID is required"),
});

export const CreateHeroSchema = z.object({
    label: z
        .string()
        .max(40, "Label cannot exceed 40 characters")
        .optional(),
    title: z
        .string()
        .min(2, "Title must be at least 2 characters")
        .max(100, "Title cannot exceed 100 characters"),
    subtitle: z
        .string()
        .min(5, "Subtitle must be at least 5 characters")
        .max(200, "Subtitle cannot exceed 200 characters"),
    image: HeroImageSchema,
    buttonLabel: z
        .string()
        .max(30, "Button label cannot exceed 30 characters")
        .optional(),
    buttonUrl: z
        .string()
        .max(300, "Button link cannot exceed 300 characters")
        .refine(
            (v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v),
            "Button link must be a relative path (e.g. /products) or a full URL"
        )
        .optional(),
    priority: z
        .number()
        .int("Priority must be an integer")
        .min(0, "Priority must be 0 or greater")
        .max(1000, "Priority cannot exceed 1000")
        .optional(),
});

export type CreateHeroRequestDto = z.infer<typeof CreateHeroSchema>;

export const EditHeroSchema = CreateHeroSchema;

export type EditHeroRequestDto = z.infer<typeof EditHeroSchema>;
