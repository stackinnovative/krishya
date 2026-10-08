import { z } from "zod";
import { HERO_LIMITS } from "../types/hero.type.js";

export const HeroImageSchema = z.object({
    url: z.string().url("Valid image URL is required"),
    publicId: z.string().min(1, "Image public ID is required"),
});

/** A page on this site ("/products") or a full web address ("https://..."). Empty means "not set". */
const linkField = (name: string) =>
    z
        .string()
        .trim()
        .max(HERO_LIMITS.url, `${name} cannot exceed ${HERO_LIMITS.url} characters`)
        .refine(
            (v) => v === "" || (v.startsWith("/") && !v.startsWith("//")) || /^https?:\/\/\S+$/.test(v),
            `${name} must be a page on this site (e.g. /products) or a full web address starting with https://`
        )
        .optional();

const optionalText = (name: string, max: number) =>
    z.string().trim().max(max, `${name} cannot exceed ${max} characters`).optional();

export const CreateHeroSchema = z
    .object({
        label: optionalText("Eyebrow text", HERO_LIMITS.label),
        title: z
            .string()
            .trim()
            .min(HERO_LIMITS.titleMin, `Headline must be at least ${HERO_LIMITS.titleMin} characters`)
            .max(HERO_LIMITS.title, `Headline cannot exceed ${HERO_LIMITS.title} characters`),
        subtitle: z
            .string()
            .trim()
            .min(HERO_LIMITS.subtitleMin, `Supporting text must be at least ${HERO_LIMITS.subtitleMin} characters`)
            .max(HERO_LIMITS.subtitle, `Supporting text cannot exceed ${HERO_LIMITS.subtitle} characters`),
        image: HeroImageSchema,
        buttonLabel: optionalText("Main button text", HERO_LIMITS.buttonLabel),
        buttonUrl: linkField("Main button link"),
        secondaryLabel: optionalText("Second link text", HERO_LIMITS.buttonLabel),
        secondaryUrl: linkField("Second link"),
        badgeText: optionalText("Badge text", HERO_LIMITS.badgeText),
        spotlightProductId: z
            .string()
            .trim()
            .refine((v) => v === "" || /^[a-f\d]{24}$/i.test(v), "Choose a valid product to spotlight")
            .optional(),
        spotlightLabel: optionalText("Spotlight tag", HERO_LIMITS.spotlightLabel),
        priority: z
            .number()
            .int("Slide position must be a whole number")
            .min(0, "Slide position must be 0 or greater")
            .max(1000, "Slide position cannot exceed 1000")
            .optional(),
    })
    .superRefine((dto, ctx) => {
        // Button text without a link would render a button that goes nowhere.
        if (dto.buttonLabel && !dto.buttonUrl) {
            ctx.addIssue({ code: "custom", path: ["buttonUrl"], message: "Add a link for the main button, or clear its text" });
        }
        // The second link is a pair: text without a link (or a link without text) renders nothing useful.
        if (dto.secondaryLabel && !dto.secondaryUrl) {
            ctx.addIssue({ code: "custom", path: ["secondaryUrl"], message: "Add a link for the second link, or clear its text" });
        }
        if (dto.secondaryUrl && !dto.secondaryLabel) {
            ctx.addIssue({ code: "custom", path: ["secondaryLabel"], message: "Add text for the second link, or clear its link" });
        }
    });

export type CreateHeroRequestDto = z.infer<typeof CreateHeroSchema>;

export const EditHeroSchema = CreateHeroSchema;

export type EditHeroRequestDto = z.infer<typeof EditHeroSchema>;
