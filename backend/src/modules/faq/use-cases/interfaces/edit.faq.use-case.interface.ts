import type { EditFaqRequestDto } from "../../dtos/faq.dto.js";

export interface IEditFaqUseCase {
    execute(id: string, dto: EditFaqRequestDto): Promise<void>;
}
