import type { CreateHeroRequestDto } from "../../dtos/hero.dto.js";

export interface ICreateHeroUseCase {
    execute(dto: CreateHeroRequestDto): Promise<void>;
}
