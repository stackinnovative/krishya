import { inject, injectable } from "tsyringe";

import type { IGetHomeFaqsUseCase } from "./interfaces/get.home.faqs.use-case.interface.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";
import { FAQ_LIMITS as L, type UserFaqView } from "../types/faq.type.js";
import { FaqMapper } from "../mappers/faq.mapper.js";

@injectable()
export class GetHomeFaqsUseCase implements IGetHomeFaqsUseCase {
    constructor(
        @inject("IFaqRepository")
        private readonly _faqRepository: IFaqRepository
    ) { }

    /** The questions picked for the home page, in FAQ-page order - or the first few if none are picked. */
    async execute(): Promise<UserFaqView[]> {
        await this._faqRepository.ensureSeeded();
        const [groups, faqs] = await Promise.all([this._faqRepository.findAllGroups(), this._faqRepository.findAllFaqs()]);
        const visible = FaqMapper.toUserGroups(groups, faqs).flatMap((g) => g.faqs);

        const picked = new Set(faqs.filter((f) => f.onHomePage).map((f) => f.id));
        const chosen = visible.filter((f) => picked.has(f.id));
        return (chosen.length ? chosen : visible.slice(0, L.homeFallback)).slice(0, L.homeMax);
    }
}
