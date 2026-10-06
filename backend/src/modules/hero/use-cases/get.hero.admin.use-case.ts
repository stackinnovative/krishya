import { inject, injectable } from "tsyringe";
import type { IGetHeroAdminUseCase } from "./interfaces/get.hero.admin.use-case.interface.js";
import type { IHeroRepository } from "../repositories/hero.repository.interface.js";
import type { HeroView } from "../types/hero.type.js";

@injectable()
export class GetHeroAdminUseCase implements IGetHeroAdminUseCase {
    constructor(
        @inject("IHeroRepository")
        private readonly _heroRepository: IHeroRepository
    ) { }

    async execute(): Promise<HeroView[]> {
        const heroBanners = await this._heroRepository.getHeroBannersForAdmin();
        return heroBanners;
    }
}
