import type { SettingsView } from "../../types/settings.type.js";

export interface IGetSettingsUseCase {
    execute(): Promise<SettingsView>;
}
