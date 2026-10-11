import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IDeleteFaqGroupUseCase } from "./interfaces/delete.faq.group.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";

@injectable()
export class DeleteFaqGroupUseCase implements IDeleteFaqGroupUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    async execute(id: string): Promise<void> {
        const group = await this._faqRepository.findGroupById(id);
        if (!group) {
            throw new CustomError(ResponseMessages.FAQ_GROUP_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        // Never delete questions as a side effect - the admin moves or deletes them first.
        if ((await this._faqRepository.countFaqsInGroup(id)) > 0) {
            throw new CustomError(ResponseMessages.FAQ_GROUP_NOT_EMPTY, HttpStatusCode.BAD_REQUEST);
        }
        await this._faqRepository.deleteGroup(id);
    }
}
