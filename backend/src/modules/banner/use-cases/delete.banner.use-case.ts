import { inject, injectable } from "tsyringe";
import type { IDeleteBannerUseCase } from "./interfaces/delete.banner.use-case.interface.js";
import type { IBannerRepository } from "../repositories/banner.repository.interface.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { deleteCloudinaryImage } from "../../../core/utils/delete.image.helper.js";

@injectable()
export class DeleteBannerUseCase implements IDeleteBannerUseCase {
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

        await this._bannerRepository.delete(id);
        await deleteCloudinaryImage(banner.image.publicId);
    }
}
