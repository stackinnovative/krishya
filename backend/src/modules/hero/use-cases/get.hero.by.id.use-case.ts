import { inject, injectable } from "tsyringe";
import type { IHeroRepository } from "../repositories/hero.repository.interface.js";
import type { HeroView } from "../types/hero.type.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import type { IGetHeroByIdUseCase } from "./interfaces/get.hero.by.id.use-case.interface.js";

@injectable()
export class GetHeroByIdUseCase implements IGetHeroByIdUseCase {
    constructor(
        @inject("IHeroRepository")
        private readonly _heroRepository: IHeroRepository
    ) { }

    async execute(id: string): Promise<HeroView> {
        const hero = await this._heroRepository.findById(id);
        if (!hero) {
            throw new CustomError(
                ResponseMessages.HERO_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            )
        }
        return {
            id: hero.id!,
            label: hero.label,
            title: hero.title,
            subtitle: hero.subtitle,
            image: hero.image,
            buttonLabel: hero.buttonLabel,
            buttonUrl: hero.buttonUrl,
            priority: hero.priority,
            isActive: hero.isActive,
        }
    }
}