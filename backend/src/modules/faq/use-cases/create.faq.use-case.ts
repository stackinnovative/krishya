import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { ICreateFaqUseCase } from "./interfaces/create.faq.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";
import type { CreateFaqRequestDto } from "../dtos/faq.dto.js";
import { Faq } from "../entities/faq.entity.js";
import { FAQ_LIMITS as L } from "../types/faq.type.js";

@injectable()
export class CreateFaqUseCase implements ICreateFaqUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    async execute(dto: CreateFaqRequestDto): Promise<void> {
        if (!(await this._faqRepository.findGroupById(dto.groupId))) {
            throw new CustomError(ResponseMessages.FAQ_GROUP_NOT_FOUND, HttpStatusCode.BAD_REQUEST);
        }
        if (dto.showOnHome && dto.isActive && (await this._faqRepository.countHomeFaqs()) >= L.homeMax) {
            throw new CustomError(ResponseMessages.FAQ_HOME_LIMIT, HttpStatusCode.BAD_REQUEST);
        }

        const order = await this._faqRepository.nextFaqOrder(dto.groupId);
        await this._faqRepository.createFaq(new Faq({ ...dto, order }));
    }
}
