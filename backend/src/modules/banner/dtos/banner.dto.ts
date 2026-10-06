import { z } from "zod";

export const BannerImageSchema = z.object({
    url: z.string().url("Valid image URL is required"),
    publicId: z.string().min(1, "Image public ID is required"),
});

export const CreateBannerSchema = z.object({
    image: BannerImageSchema,
    buttonUrl: z
        .string()
        .max(300, "Button link cannot exceed 300 characters")
        .refine(
            (v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v),
            "Button link must be a relative path (e.g. /products) or a full URL"
        )
        .optional(),
});

export type CreateBannerRequestDto = z.infer<typeof CreateBannerSchema>;

export const EditBannerSchema = CreateBannerSchema;

export type EditBannerRequestDto = z.infer<typeof EditBannerSchema>;
