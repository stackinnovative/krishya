import { z } from "zod";
import { ABOUT_LIMITS as L } from "../types/about.type.js";

const AboutImageSchema = z
    .object({
        url: z.string().url("Valid image URL is required"),
        publicId: z.string().min(1, "Image public ID is required"),
    })
    .nullable();

const text = (name: string, max: number, min = 0) =>
    z
        .string()
        .trim()
        .min(min, min === 1 ? `${name} is required` : `${name} must be at least ${min} characters`)
        .max(max, `${name} cannot exceed ${max} characters`);

export const UpdateAboutSchema = z.object({
    teaser: z.object({
        eyebrow: text("Teaser eyebrow", L.eyebrow),
        title: text("Teaser title", L.title, 1),
        summary: text("Short summary", L.summary, L.summaryMin),
        image: AboutImageSchema,
        linkLabel: text("Link text", L.linkLabel, 1),
        showOnHome: z.boolean(),
    }),
    header: z.object({
        eyebrow: text("Page eyebrow", L.eyebrow),
        title: text("Page title", L.title, 1),
        subtitle: text("Page subtitle", L.subtitle),
        image: AboutImageSchema,
    }),
    story: z.object({
        heading: text("Story heading", L.heading, 1),
        paragraphs: z
            .array(text("Paragraph", L.paragraph, 1))
            .min(L.paragraphsMin, "Add at least one story paragraph")
            .max(L.paragraphsMax, `The story can have at most ${L.paragraphsMax} paragraphs`),
        closing: text("Closing lines", L.closing),
    }),
    stat: z
        .object({
            value: text("Stat value", L.statValue),
            label: text("Stat label", L.statLabel),
        })
        .superRefine((stat, ctx) => {
            // A number without its caption (or the reverse) reads as a broken highlight.
            if (stat.value && !stat.label) ctx.addIssue({ code: "custom", path: ["label"], message: "Add a label for the stat, or clear its value" });
            if (stat.label && !stat.value) ctx.addIssue({ code: "custom", path: ["value"], message: "Add a value for the stat, or clear its label" });
        }),
    tribute: z.object({
        image: AboutImageSchema,
        quote: text("Tribute quote", L.quote),
        name: text("Name", L.name),
        role: text("Role", L.role),
    }),
});

export type UpdateAboutRequestDto = z.infer<typeof UpdateAboutSchema>;
