import { Settings } from "../entities/settings.entity.js";

export interface ISettingsRepository {
    /** Always resolves to a value - creates the singleton document with defaults
     * the first time it's ever called (e.g. on a brand-new store), so every
     * consumer (pricing, storefront, emails) can rely on settings always existing. */
    getSettings(): Promise<Settings>;
    updateSettings(settingsEntity: Settings): Promise<Settings>;
}
