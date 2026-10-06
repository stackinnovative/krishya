import { Settings, SETTINGS_DEFAULTS } from "../entities/settings.entity.js";
import type { SettingsView } from "../types/settings.type.js";

export class SettingsMapper {
    static toDomain(settingsModelData: any): Settings | null {
        if (!settingsModelData) return null;

        const idString = settingsModelData._id?.toString() || settingsModelData.id?.toString();

        if (!idString) {
            console.error("Settings data from DB is missing an ID:", settingsModelData);
            return null;
        }

        return new Settings({
            id: idString,
            storeName: settingsModelData.storeName,
            email: settingsModelData.email,
            phone: settingsModelData.phone ?? "",
            logo: settingsModelData.logo
                ? { url: settingsModelData.logo.url, publicId: settingsModelData.logo.publicId }
                : null,
            deliveryCharge: settingsModelData.deliveryCharge,
            freeAbove: settingsModelData.freeAbove,
            cod: settingsModelData.cod,
            maintenance: settingsModelData.maintenance,
            // .lean() (used by SettingsRepository.getSettings) bypasses Mongoose's
            // schema-default hydration, so a document that predates this field
            // comes back with it simply missing rather than defaulted - backfill
            // the same seeded defaults here instead of an empty list.
            refundReturnSections: settingsModelData.refundReturnSections ?? SETTINGS_DEFAULTS.refundReturnSections,
            privacyPolicySections: settingsModelData.privacyPolicySections ?? SETTINGS_DEFAULTS.privacyPolicySections,
        });
    }

    static toPersistence(settingsEntity: Settings): any {
        return {
            storeName: settingsEntity.storeName,
            email: settingsEntity.email,
            phone: settingsEntity.phone,
            logo: settingsEntity.logo,
            deliveryCharge: settingsEntity.deliveryCharge,
            freeAbove: settingsEntity.freeAbove,
            cod: settingsEntity.cod,
            maintenance: settingsEntity.maintenance,
            refundReturnSections: settingsEntity.refundReturnSections,
            privacyPolicySections: settingsEntity.privacyPolicySections,
        };
    }

    static toView(settingsEntity: Settings): SettingsView {
        return {
            id: settingsEntity.id!,
            storeName: settingsEntity.storeName,
            email: settingsEntity.email,
            phone: settingsEntity.phone,
            logo: settingsEntity.logo,
            deliveryCharge: settingsEntity.deliveryCharge,
            freeAbove: settingsEntity.freeAbove,
            cod: settingsEntity.cod,
            maintenance: settingsEntity.maintenance,
            refundReturnSections: settingsEntity.refundReturnSections,
            privacyPolicySections: settingsEntity.privacyPolicySections,
        };
    }
}
