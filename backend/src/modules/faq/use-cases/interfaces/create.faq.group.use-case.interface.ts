import type { CreateFaqGroupRequestDto } from "../../dtos/faq.dto.js";

export interface ICreateFaqGroupUseCase {
    execute(dto: CreateFaqGroupRequestDto): Promise<void>;
}
