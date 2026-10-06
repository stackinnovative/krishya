import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { Hero } from "../entities/hero.entity.js";
import type { ICreateHeroUseCase } from "./interfaces/create.hero.use-case.interface.js";
import type { IHeroRepository } from "../repositories/hero.repository.interface.js";
import type { CreateHeroRequestDto } from "../dtos/hero.dto.js";

@injectable()
export class CreateHeroUseCase implements ICreateHeroUseCase {
    constructor(
        @inject("IHeroRepository")
        private readonly _heroRepository: IHeroRepository
    ) { }

    async execute(dto: CreateHeroRequestDto): Promise<void> {
        // Allow multiple hero banners — removed previous restriction that
        // blocked creation when any hero already existed.

        // Validate priority uniqueness
        if (typeof dto.priority === 'number') {
            const existing = await this._heroRepository.findByPriority(dto.priority);
            if (existing) {
                throw new CustomError(
                    `Hero with priority ${dto.priority} already exists`,
                    HttpStatusCode.BAD_REQUEST
                );
            }
        }

        const heroEntity = new Hero({
            id: null,
            label: dto.label,
            title: dto.title,
            subtitle: dto.subtitle,
            image: dto.image,
            buttonLabel: dto.buttonLabel,
            buttonUrl: dto.buttonUrl,
            priority: dto.priority,
            isActive: true,
        });

        const hero = await this._heroRepository.create(heroEntity);

        if (!hero) {
            throw new CustomError(
                ResponseMessages.HERO_CREATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
