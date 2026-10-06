import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { deleteCloudinaryImage } from "../../../core/utils/delete.image.helper.js";

import { Banner } from "../entities/banner.entity.js";
import type { ICreateBannerUseCase } from "./interfaces/create.banner.use-case.interface.js";
import type { IBannerRepository } from "../repositories/banner.repository.interface.js";
import type { CreateBannerRequestDto } from "../dtos/banner.dto.js";

const MAX_BANNERS = 3;

@injectable()
export class CreateBannerUseCase implements ICreateBannerUseCase {
    constructor(
        @inject("IBannerRepository")
        private readonly _bannerRepository: IBannerRepository
    ) { }

    async execute(dto: CreateBannerRequestDto): Promise<void> {
        const existingBanners = await this._bannerRepository.findAll();

        if (existingBanners.length >= MAX_BANNERS) {
            const oldestBanner = existingBanners[0]!;
            await this._bannerRepository.delete(oldestBanner.id!);
            await deleteCloudinaryImage(oldestBanner.image.publicId);
        }

        const bannerEntity = new Banner({
            id: null,
            image: dto.image,
            buttonUrl: dto.buttonUrl,
            isActive: true,
        });

        const banner = await this._bannerRepository.create(bannerEntity);

        if (!banner) {
            throw new CustomError(
                ResponseMessages.BANNER_CREATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
