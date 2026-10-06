import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IUnblockHeroUseCase } from "./interfaces/unblock.hero.use-case.interface.js";
import type { IHeroRepository } from "../repositories/hero.repository.interface.js";

@injectable()
export class UnblockHeroUseCase implements IUnblockHeroUseCase {
    constructor(
        @inject("IHeroRepository")
        private readonly _heroRepository: IHeroRepository
    ) { }

    async execute(id: string): Promise<void> {
        const hero = await this._heroRepository.findById(id);

        if (!hero) {
            throw new CustomError(
                ResponseMessages.HERO_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }
        if (hero.isActive) {
            throw new CustomError(
                ResponseMessages.HERO_ALREADY_ACTIVATED,
                HttpStatusCode.BAD_REQUEST
            );
        }

        const updatedHero = hero.activate();

        const saved = await this._heroRepository.save(updatedHero);

        if (!saved) {
            throw new CustomError(
                ResponseMessages.HERO_ACTIVATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
