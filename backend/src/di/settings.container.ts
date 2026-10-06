import { container } from "tsyringe";
import type { ISettingsRepository } from "../modules/settings/repositories/settings.repository.interface.js";
import { SettingsRepository } from "../modules/settings/repositories/settings.repository.js";
import type { IGetSettingsUseCase } from "../modules/settings/use-cases/interfaces/get.settings.use-case.interface.js";
import { GetSettingsUseCase } from "../modules/settings/use-cases/get.settings.use-case.js";
import type { IUpdateSettingsUseCase } from "../modules/settings/use-cases/interfaces/update.settings.use-case.interface.js";
import { UpdateSettingsUseCase } from "../modules/settings/use-cases/update.settings.use-case.js";

export const registerSettingsDependencies = () => {
    container.register<ISettingsRepository>("ISettingsRepository", {
        useClass: SettingsRepository,
    });
    container.register<IGetSettingsUseCase>("IGetSettingsUseCase", {
        useClass: GetSettingsUseCase,
    });
    container.register<IUpdateSettingsUseCase>("IUpdateSettingsUseCase", {
        useClass: UpdateSettingsUseCase,
    });
}
