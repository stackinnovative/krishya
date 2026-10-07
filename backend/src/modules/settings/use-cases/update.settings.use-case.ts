import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IUpdateSettingsUseCase } from "./interfaces/update.settings.use-case.interface.js";
import type { ISettingsRepository } from "../repositories/settings.repository.interface.js";
import type { UpdateSettingsRequestDto } from "../dtos/settings.dto.js";
import type { SettingsView } from "../types/settings.type.js";
import { Settings } from "../entities/settings.entity.js";
import { SettingsMapper } from "../mappers/settings.mapper.js";
import { deleteCloudinaryImage } from "../../../core/utils/delete.image.helper.js";

@injectable()
export class UpdateSettingsUseCase implements IUpdateSettingsUseCase {
    constructor(
        @inject("ISettingsRepository")
        private readonly _settingsRepository: ISettingsRepository
    ) { }

    async execute(dto: UpdateSettingsRequestDto): Promise<SettingsView> {
        const current = await this._settingsRepository.getSettings();

        // Logo removed or swapped for a different upload - the old Cloudinary
        // asset is now orphaned, so clean it up instead of leaking storage.
        if (current.logo && current.logo.publicId !== dto.logo?.publicId) {
            await deleteCloudinaryImage(current.logo.publicId);
        }

        const updatedEntity = new Settings({
            id: current.id,
            storeName: dto.storeName,
            email: dto.email,
            phone: dto.phone ?? "",
            logo: dto.logo ?? null,
            deliveryCharge: dto.deliveryCharge,
            freeAbove: dto.freeAbove,
            cod: dto.cod,
            maintenance: dto.maintenance,
            refundReturnSections: dto.refundReturnSections,
            privacyPolicySections: dto.privacyPolicySections,
            socialLinks: dto.socialLinks,
        });

        const saved = await this._settingsRepository.updateSettings(updatedEntity);

        if (!saved) {
            throw new CustomError(
                ResponseMessages.SETTINGS_UPDATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }

        return SettingsMapper.toView(saved);
    }
}
