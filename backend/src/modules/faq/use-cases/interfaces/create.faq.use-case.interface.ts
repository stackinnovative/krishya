import type { CreateFaqRequestDto } from "../../dtos/faq.dto.js";

export interface ICreateFaqUseCase {
    execute(dto: CreateFaqRequestDto): Promise<void>;
}
