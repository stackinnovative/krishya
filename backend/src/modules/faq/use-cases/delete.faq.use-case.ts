import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IDeleteFaqUseCase } from "./interfaces/delete.faq.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";

@injectable()
export class DeleteFaqUseCase implements IDeleteFaqUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    async execute(id: string): Promise<void> {
        if (!(await this._faqRepository.findFaqById(id))) {
            throw new CustomError(ResponseMessages.FAQ_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        }
        await this._faqRepository.deleteFaq(id);
    }
}
