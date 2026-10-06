import { inject, injectable } from "tsyringe";
import type { IGetHeroUserUseCase } from "./interfaces/get.hero.user.use-case.interface.js";
import type { IHeroRepository } from "../repositories/hero.repository.interface.js";
import type { UserHeroView } from "../types/hero.type.js";

@injectable()
export class GetHeroUserUseCase implements IGetHeroUserUseCase {
    constructor(
        @inject("IHeroRepository")
        private readonly _heroRepository: IHeroRepository
    ) { }

    async execute(): Promise<UserHeroView[]> {
        const heroBanners = await this._heroRepository.getHeroBannersForUser();
        return heroBanners;
    }
}
