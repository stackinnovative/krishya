import { z } from "zod";
import { POLICY_ICON_NAMES } from "../types/settings.type.js";

export const SettingsLogoSchema = z.object({
    url: z.string().url("Valid logo image URL is required"),
    publicId: z.string().min(1, "Logo image public ID is required"),
});

export const PolicySectionSchema = z.object({
    heading: z.string().min(1, "Section heading is required").max(100, "Section heading cannot exceed 100 characters"),
    icon: z.enum(POLICY_ICON_NAMES, { message: "Invalid icon selected" }),
    description: z.string().min(1, "Section description is required").max(1000, "Section description cannot exceed 1000 characters"),
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
});

export type UpdateSettingsRequestDto = z.infer<typeof UpdateSettingsSchema>;
