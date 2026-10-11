import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IEditFaqUseCase } from "./interfaces/edit.faq.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";
import type { EditFaqRequestDto } from "../dtos/faq.dto.js";
import { FAQ_LIMITS as L } from "../types/faq.type.js";

@injectable()
export class EditFaqUseCase implements IEditFaqUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    async execute(id: string, dto: EditFaqRequestDto): Promise<void> {
        const faq = await this._faqRepository.findFaqById(id);
        if (!faq) {
            throw new CustomError(ResponseMessages.FAQ_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        const movedGroup = dto.groupId !== faq.groupId;
        if (movedGroup && !(await this._faqRepository.findGroupById(dto.groupId))) {
            throw new CustomError(ResponseMessages.FAQ_GROUP_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
        }
        if (dto.showOnHome && dto.isActive && (await this._faqRepository.countHomeFaqs(id)) >= L.homeMax) {
            throw new CustomError(ResponseMessages.FAQ_HOME_LIMIT, HttpStatusCode.BAD_REQUEST);
        }

        // A question moved to another group goes to the end of that group.
        const order = movedGroup ? await this._faqRepository.nextFaqOrder(dto.groupId) : faq.order;
        await this._faqRepository.saveFaq(faq.updateDetails({ ...dto, order }));
    }
}
