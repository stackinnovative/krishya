import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { deleteCloudinaryImage } from "../../../core/utils/delete.image.helper.js";

import type { IUpdateAboutUseCase } from "./interfaces/update.about.use-case.interface.js";
import type { IAboutRepository } from "../repositories/about.repository.interface.js";
import type { UpdateAboutRequestDto } from "../dtos/about.dto.js";
import type { AboutView } from "../types/about.type.js";
import { About } from "../entities/about.entity.js";
import { AboutMapper } from "../mappers/about.mapper.js";

@injectable()
export class UpdateAboutUseCase implements IUpdateAboutUseCase {
    constructor(
        @inject("IAboutRepository")
        private readonly _aboutRepository: IAboutRepository
    ) { }

    async execute(dto: UpdateAboutRequestDto): Promise<AboutView> {
        const current = await this._aboutRepository.getAbout();
        const next = new About({ id: current.id, ...dto });

        const saved = await this._aboutRepository.updateAbout(next);
        if (!saved) {
            throw new CustomError(ResponseMessages.ABOUT_UPDATE_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        // Only once the save succeeded: photos the new content no longer uses are
        // orphaned. A failed delete just leaves a stray file, so it never fails the save.
        await Promise.all(
            current.replacedImageIds(saved).map((publicId) =>
                this.removeImage(publicId).catch((err) => console.error("Could not delete replaced About image:", publicId, err))
            )
        );

        return AboutMapper.toView(saved);
    }

    /** Deletes a replaced photo from Cloudinary (overridden in tests). */
    protected removeImage(publicId: string): Promise<void> {
        return deleteCloudinaryImage(publicId);
    }
}
