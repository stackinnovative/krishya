import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IEditFaqGroupUseCase } from "./interfaces/edit.faq.group.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";
import type { EditFaqGroupRequestDto } from "../dtos/faq.dto.js";

@injectable()
export class EditFaqGroupUseCase implements IEditFaqGroupUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    async execute(id: string, dto: EditFaqGroupRequestDto): Promise<void> {
        const group = await this._faqRepository.findGroupById(id);
        if (!group) {
            throw new CustomError(ResponseMessages.FAQ_GROUP_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        await this._faqRepository.saveGroup(group.updateDetails(dto));
    }
}
