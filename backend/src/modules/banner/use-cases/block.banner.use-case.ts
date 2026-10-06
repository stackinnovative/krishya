import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IBlockBannerUseCase } from "./interfaces/block.banner.use-case.interface.js";
import type { IBannerRepository } from "../repositories/banner.repository.interface.js";

@injectable()
export class BlockBannerUseCase implements IBlockBannerUseCase {
    constructor(
        @inject("IBannerRepository")
        private readonly _bannerRepository: IBannerRepository
    ) { }

    async execute(id: string): Promise<void> {
        const banner = await this._bannerRepository.findById(id);

        if (!banner) {
            throw new CustomError(
                ResponseMessages.BANNER_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }

        if (!banner.isActive) {
            throw new CustomError(
                ResponseMessages.BANNER_ALREADY_DEACTIVATED,
                HttpStatusCode.BAD_REQUEST
            );
        }

        const updatedBanner = banner.deactivate();

        const saved = await this._bannerRepository.save(updatedBanner);

        if (!saved) {
            throw new CustomError(
                ResponseMessages.BANNER_DEACTIVATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
