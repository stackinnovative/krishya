import { inject, injectable } from "tsyringe";
import type { IGetAboutUseCase } from "./interfaces/get.about.use-case.interface.js";
import type { IAboutRepository } from "../repositories/about.repository.interface.js";
import type { AboutView } from "../types/about.type.js";
import { AboutMapper } from "../mappers/about.mapper.js";

@injectable()
export class GetAboutUseCase implements IGetAboutUseCase {
    constructor(
        @inject("IAboutRepository")
        private readonly _aboutRepository: IAboutRepository
    ) { }

    async execute(): Promise<AboutView> {
        const about = await this._aboutRepository.getAbout();
        return AboutMapper.toView(about);
    }
}
