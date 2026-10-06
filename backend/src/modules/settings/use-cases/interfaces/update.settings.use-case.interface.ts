import type { UpdateSettingsRequestDto } from "../../dtos/settings.dto.js";
import type { SettingsView } from "../../types/settings.type.js";

export interface IUpdateSettingsUseCase {
    execute(dto: UpdateSettingsRequestDto): Promise<SettingsView>;
}
