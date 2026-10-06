import { inject, injectable } from "tsyringe";
import type { IGetSettingsUseCase } from "./interfaces/get.settings.use-case.interface.js";
import type { ISettingsRepository } from "../repositories/settings.repository.interface.js";
import type { SettingsView } from "../types/settings.type.js";
import { SettingsMapper } from "../mappers/settings.mapper.js";

@injectable()
export class GetSettingsUseCase implements IGetSettingsUseCase {
    constructor(
        @inject("ISettingsRepository")
        private readonly _settingsRepository: ISettingsRepository
    ) { }

    async execute(): Promise<SettingsView> {
        const settings = await this._settingsRepository.getSettings();
        return SettingsMapper.toView(settings);
    }
}
