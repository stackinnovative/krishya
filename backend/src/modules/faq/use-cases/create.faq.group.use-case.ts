import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { ICreateFaqGroupUseCase } from "./interfaces/create.faq.group.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";
import type { CreateFaqGroupRequestDto } from "../dtos/faq.dto.js";
import { FaqGroup } from "../entities/faq.group.entity.js";

@injectable()
export class CreateFaqGroupUseCase implements ICreateFaqGroupUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    async execute(dto: CreateFaqGroupRequestDto): Promise<void> {
        await this._faqRepository.ensureSeeded();
        const order = await this._faqRepository.nextGroupOrder();
        const created = await this._faqRepository.createGroup(new FaqGroup({ ...dto, order }));
        if (!created?.id) {
            throw new CustomError(ResponseMessages.SERVER_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}
