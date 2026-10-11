import { inject, injectable } from "tsyringe";

import type { IGetFaqsUserUseCase } from "./interfaces/get.faqs.user.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";
import type { UserFaqGroupView } from "../types/faq.type.js";
import { FaqMapper } from "../mappers/faq.mapper.js";

@injectable()
export class GetFaqsUserUseCase implements IGetFaqsUserUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    async execute(): Promise<UserFaqGroupView[]> {
        await this._faqRepository.ensureSeeded();
        const [groups, faqs] = await Promise.all([this._faqRepository.findAllGroups(), this._faqRepository.findAllFaqs()]);
        return FaqMapper.toUserGroups(groups, faqs);
    }
}
