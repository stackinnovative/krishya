import type { UserHeroView } from "../../types/hero.type.js";

export interface IGetHeroUserUseCase {
    execute(): Promise<UserHeroView[]>;
}
