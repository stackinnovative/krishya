import type { EditFaqGroupRequestDto } from "../../dtos/faq.dto.js";

export interface IEditFaqGroupUseCase {
    execute(id: string, dto: EditFaqGroupRequestDto): Promise<void>;
}
