import type { HeroView } from "../../types/hero.type.js";

export interface IGetHeroAdminUseCase {
    execute(): Promise<HeroView[]>;
}
