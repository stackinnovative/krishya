import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IReorderFaqGroupsUseCase } from "./interfaces/reorder.faq.groups.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";
import type { ReorderRequestDto } from "../dtos/faq.dto.js";

@injectable()
export class ReorderFaqGroupsUseCase implements IReorderFaqGroupsUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    async execute(dto: ReorderRequestDto): Promise<void> {
        const groups = await this._faqRepository.findAllGroups();
        const current = new Set(groups.map((g) => g.id));
        // The new order must list exactly the groups that exist - no more, no fewer.
        if (dto.ids.length !== current.size || !dto.ids.every((id) => current.has(id))) {
            throw new CustomError(ResponseMessages.FAQ_REORDER_MISMATCH, HttpStatusCode.CONFLICT);
        }
        await this._faqRepository.setGroupOrder(dto.ids);
    }
}
