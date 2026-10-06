import type { HeroView } from "../../types/hero.type.js";

export interface IGetHeroByIdUseCase {
    execute(id: string): Promise<HeroView>;
}