import { Schema, model, Document } from "mongoose";
import { SETTINGS_DEFAULTS } from "../entities/settings.entity.js";
import type { PolicyIconName, SocialIconName } from "../types/settings.type.js";

export interface IPolicySection {
    heading: string;
    icon: PolicyIconName;
    description: string;
}

export interface ISocialLink {
    icon: SocialIconName;
    label: string;
    url: string;
}

export interface ISettings extends Document {
    storeName: string;
    email: string;
    phone: string;
    logo: { url: string; publicId: string } | null;
    deliveryCharge: number;
    freeAbove: number;
    cod: boolean;
    maintenance: boolean;
    refundReturnSections: IPolicySection[];
    privacyPolicySections: IPolicySection[];
    socialLinks: ISocialLink[];
}

const settingsSchema = new Schema<ISettings>(
    {
        storeName: { type: String, required: true, trim: true, default: SETTINGS_DEFAULTS.storeName },
        email: { type: String, required: true, trim: true, default: SETTINGS_DEFAULTS.email },
        phone: { type: String, trim: true, default: SETTINGS_DEFAULTS.phone },
        logo: {
            type: new Schema(
                { url: { type: String, required: true }, publicId: { type: String, required: true } },
                { _id: false }
            ),
            default: null,
        },
        deliveryCharge: { type: Number, required: true, min: 0, default: SETTINGS_DEFAULTS.deliveryCharge },
        freeAbove: { type: Number, required: true, min: 0, default: SETTINGS_DEFAULTS.freeAbove },
        cod: { type: Boolean, default: SETTINGS_DEFAULTS.cod },
        maintenance: { type: Boolean, default: SETTINGS_DEFAULTS.maintenance },
        refundReturnSections: {
            type: [
                new Schema(
                    {
                        heading: { type: String, required: true, trim: true },
                        icon: { type: String, required: true },
                        description: { type: String, required: true, trim: true },
                    },
                    { _id: false }
                ),
            ],
            default: SETTINGS_DEFAULTS.refundReturnSections,
        },
        privacyPolicySections: {
            type: [
                new Schema(
                    {
                        heading: { type: String, required: true, trim: true },
                        icon: { type: String, required: true },
                        description: { type: String, required: true, trim: true },
                    },
                    { _id: false }
                ),
            ],
            default: SETTINGS_DEFAULTS.privacyPolicySections,
        },
        socialLinks: {
            type: [
                new Schema(
                    {
                        icon: { type: String, required: true },
                        label: { type: String, trim: true, default: "" },
                        url: { type: String, required: true, trim: true },
                    },
                    { _id: false }
                ),
            ],
            default: SETTINGS_DEFAULTS.socialLinks,
        },
    },
    {
        timestamps: true,
    }
);

// Business settings is a singleton - every write targets the same (only) document,
// so a stray second insert can never fragment "the" store settings into two records.
export const SettingsModel = model<ISettings>("Settings", settingsSchema);
