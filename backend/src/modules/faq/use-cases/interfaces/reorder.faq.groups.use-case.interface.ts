import type { ReorderRequestDto } from "../../dtos/faq.dto.js";

export interface IReorderFaqGroupsUseCase {
    execute(dto: ReorderRequestDto): Promise<void>;
}
