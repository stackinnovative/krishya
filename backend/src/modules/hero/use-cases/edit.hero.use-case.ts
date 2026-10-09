import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IEditHeroUseCase } from "./interfaces/edit.hero.use-case.interface.js";
import type { IHeroRepository } from "../repositories/hero.repository.interface.js";
import type { EditHeroRequestDto } from "../dtos/hero.dto.js";
import { deleteCloudinaryImage } from "../../../core/utils/delete.image.helper.js";

@injectable()
export class EditHeroUseCase implements IEditHeroUseCase {
    constructor(
        @inject("IHeroRepository")
        private readonly _heroRepository: IHeroRepository
    ) { }

    async execute(
        id: string,
        dto: EditHeroRequestDto
    ): Promise<void> {
        const hero = await this._heroRepository.findById(id);

        if (!hero) {
            throw new CustomError(
                ResponseMessages.HERO_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }

        if (hero.image.publicId !== dto.image.publicId) {
            await deleteCloudinaryImage(hero.image.publicId);
        }

        // Validate priority uniqueness on edit
        if (typeof dto.priority === 'number') {
            const existing = await this._heroRepository.findByPriority(dto.priority, id);
            if (existing) {
                throw new CustomError(
                    `Slide position ${dto.priority} is already used by another slide - choose a different position`,
                    HttpStatusCode.BAD_REQUEST
                );
            }
        }

        const updatedHero = hero.updateDetails({
            label: dto.label,
            title: dto.title,
            subtitle: dto.subtitle,
            image: dto.image,
            buttonLabel: dto.buttonLabel,
            buttonUrl: dto.buttonUrl,
            secondaryLabel: dto.secondaryLabel,
            secondaryUrl: dto.secondaryUrl,
            badgeText: dto.badgeText,
            spotlightProductId: dto.spotlightProductId,
            spotlightLabel: dto.spotlightLabel,
            priority: dto.priority,
        });

        const saved = await this._heroRepository.save(updatedHero);

        if (!saved) {
            throw new CustomError(
                ResponseMessages.HERO_UPDATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
