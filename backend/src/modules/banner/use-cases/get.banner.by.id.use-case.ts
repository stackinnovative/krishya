import { inject, injectable } from "tsyringe";
import type { IBannerRepository } from "../repositories/banner.repository.interface.js";
import type { IGetBannerByIdUseCase } from "./interfaces/get.banner.by.id.use-case.interface.js";
import type { BannerView } from "../types/banner.type.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

@injectable()
export class GetBannerByIdUseCase implements IGetBannerByIdUseCase {
    constructor(
        @inject("IBannerRepository")
        private readonly _bannerRepository: IBannerRepository,
    ) { }

    async execute(id: string): Promise<BannerView> {
        const banner = await this._bannerRepository.findById(id);
        if (!banner) {
            throw new CustomError(
                ResponseMessages.BANNER_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            )
        }
        return {
            id: banner.id!,
            image: banner.image,
            isActive: banner.isActive,
        }
    }
}