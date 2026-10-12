import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IEditBannerUseCase } from "./interfaces/edit.banner.use-case.interface.js";
import type { IBannerRepository } from "../repositories/banner.repository.interface.js";
import type { EditBannerRequestDto } from "../dtos/banner.dto.js";
import { deleteCloudinaryImage } from "../../../core/utils/delete.image.helper.js";

@injectable()
export class EditBannerUseCase implements IEditBannerUseCase {
    constructor(
        @inject("IBannerRepository")
        private readonly _bannerRepository: IBannerRepository
    ) { }

    async execute(
        id: string,
        dto: EditBannerRequestDto
    ): Promise<void> {
        const banner = await this._bannerRepository.findById(id);

        if (!banner) {
            throw new CustomError(
                ResponseMessages.BANNER_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }

        const updatedBanner = banner.updateDetails({
            image: dto.image,
            buttonUrl: dto.buttonUrl,
        });

        const saved = await this._bannerRepository.save(updatedBanner);

        if (!saved) {
            throw new CustomError(
                ResponseMessages.BANNER_UPDATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }

        // Only once the new photo is saved is the old one safe to remove; a failed delete just leaves a stray file.
        if (banner.image.publicId !== dto.image.publicId) {
            await deleteCloudinaryImage(banner.image.publicId).catch((err) => console.error("Could not delete replaced banner image:", err));
        }
    }
}
