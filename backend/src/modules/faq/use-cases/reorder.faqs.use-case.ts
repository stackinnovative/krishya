import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IReorderFaqsUseCase } from "./interfaces/reorder.faqs.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";
import type { ReorderRequestDto } from "../dtos/faq.dto.js";

@injectable()
export class ReorderFaqsUseCase implements IReorderFaqsUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    async execute(groupId: string, dto: ReorderRequestDto): Promise<void> {
        if (!(await this._faqRepository.findGroupById(groupId))) {
            throw new CustomError(ResponseMessages.FAQ_GROUP_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        const inGroup = new Set((await this._faqRepository.findAllFaqs()).filter((f) => f.groupId === groupId).map((f) => f.id));
        // The new order must list exactly this group's questions - no more, no fewer.
        if (dto.ids.length !== inGroup.size || !dto.ids.every((id) => inGroup.has(id))) {
            throw new CustomError(ResponseMessages.FAQ_REORDER_MISMATCH, HttpStatusCode.CONFLICT);
        }
        await this._faqRepository.setFaqOrder(dto.ids);
    }
}
