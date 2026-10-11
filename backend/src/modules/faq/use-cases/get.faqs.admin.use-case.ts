import { inject, injectable } from "tsyringe";

import type { IGetFaqsAdminUseCase } from "./interfaces/get.faqs.admin.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";
import type { AdminFaqGroupView } from "../types/faq.type.js";
import { FaqMapper } from "../mappers/faq.mapper.js";

@injectable()
export class GetFaqsAdminUseCase implements IGetFaqsAdminUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    async execute(): Promise<AdminFaqGroupView[]> {
        await this._faqRepository.ensureSeeded();
        const [groups, faqs] = await Promise.all([this._faqRepository.findAllGroups(), this._faqRepository.findAllFaqs()]);
        return FaqMapper.toAdminGroups(groups, faqs);
    }
}
