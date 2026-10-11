import type { ReorderRequestDto } from "../../dtos/faq.dto.js";

export interface IReorderFaqsUseCase {
    execute(groupId: string, dto: ReorderRequestDto): Promise<void>;
}
