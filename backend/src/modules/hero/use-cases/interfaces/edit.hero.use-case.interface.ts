import type { EditHeroRequestDto } from "../../dtos/hero.dto.js";

export interface IEditHeroUseCase {
    execute(id: string, dto: EditHeroRequestDto): Promise<void>;
}
