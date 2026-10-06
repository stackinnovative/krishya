import { injectable } from "tsyringe";
import type { ISettingsRepository } from "./settings.repository.interface.js";
import { Settings } from "../entities/settings.entity.js";
import { SettingsModel } from "../infrastructure/settings.schema.js";
import { SettingsMapper } from "../mappers/settings.mapper.js";

@injectable()
export class SettingsRepository implements ISettingsRepository {
    async getSettings(): Promise<Settings> {
        const existing = await SettingsModel.findOne().lean();
        if (existing) {
            return SettingsMapper.toDomain(existing)!;
        }

        // First read ever for this store - materialize the singleton with schema defaults.
        const created = await SettingsModel.create({});
        return SettingsMapper.toDomain(created.toObject())!;
    }

    async updateSettings(settingsEntity: Settings): Promise<Settings> {
        const persistenceData = SettingsMapper.toPersistence(settingsEntity);

        // Empty filter + upsert targets "the" one settings document regardless of
        // whether it already exists, keeping this a true singleton under concurrent writes.
        const updated = await SettingsModel.findOneAndUpdate(
            {},
            { $set: persistenceData },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        ).lean();

        return SettingsMapper.toDomain(updated)!;
    }
}
