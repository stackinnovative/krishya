import type { UpdateAboutRequestDto } from "../../dtos/about.dto.js";
import type { AboutView } from "../../types/about.type.js";

export interface IUpdateAboutUseCase {
    execute(dto: UpdateAboutRequestDto): Promise<AboutView>;
}
