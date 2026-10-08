import { z } from "zod";
import { MAX_SOCIAL_LINKS, POLICY_ICON_NAMES, SOCIAL_ICON_NAMES } from "../types/settings.type.js";

export const SettingsLogoSchema = z.object({
    url: z.string().url("Valid logo image URL is required"),
    publicId: z.string().min(1, "Logo image public ID is required"),
});

export const PolicySectionSchema = z.object({
    heading: z.string().min(1, "Section heading is required").max(100, "Section heading cannot exceed 100 characters"),
    icon: z.enum(POLICY_ICON_NAMES, { message: "Invalid icon selected" }),
    description: z.string().min(1, "Section description is required").max(1000, "Section description cannot exceed 1000 characters"),
});

const SOCIAL_URL_PROTOCOLS = ["http:", "https:", "mailto:"];

/** Blocks javascript:/data: and other schemes from ever being rendered as a storefront link. */
const hasAllowedProtocol = (value: string) => {
    try {
        return SOCIAL_URL_PROTOCOLS.includes(new URL(value).protocol);
    } catch {
        return false;
    }
};

export const SocialLinkSchema = z.object({
    icon: z.enum(SOCIAL_ICON_NAMES, { message: "Invalid social media icon selected" }),
    label: z.string().trim().max(40, "Label cannot exceed 40 characters").optional().default(""),
    url: z
        .string()
        .trim()
        .min(1, "Link URL is required")
        .max(500, "Link URL is too long")
        .url("Enter a full link, e.g. https://instagram.com/yourstore")
        .refine(hasAllowedProtocol, "Link must start with https:// (or mailto: for email)"),
});

export const UpdateSettingsSchema = z.object({
    storeName: z
        .string()
        .min(2, "Store name must be at least 2 characters")
        .max(100, "Store name cannot exceed 100 characters"),
    email: z.string().email("Enter a valid support email address"),
    phone: z.string().max(20, "Phone number looks too long").optional().default(""),
    logo: SettingsLogoSchema.nullable().optional().default(null),
    deliveryCharge: z.number().min(0, "Delivery charge cannot be negative"),
    freeAbove: z.number().min(0, "Free delivery threshold cannot be negative"),
    cod: z.boolean(),
    maintenance: z.boolean(),
    refundReturnSections: z.array(PolicySectionSchema).max(20, "Cannot have more than 20 sections"),
    privacyPolicySections: z.array(PolicySectionSchema).max(20, "Cannot have more than 20 sections"),
    socialLinks: z.array(SocialLinkSchema).max(MAX_SOCIAL_LINKS, `Cannot have more than ${MAX_SOCIAL_LINKS} social links`).optional().default([]),
});

export type UpdateSettingsRequestDto = z.infer<typeof UpdateSettingsSchema>;
