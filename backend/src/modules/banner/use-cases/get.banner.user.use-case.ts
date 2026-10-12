import { inject, injectable } from "tsyringe";
import type { IGetBannerUserUseCase } from "./interfaces/get.banner.user.use-case.interface.js";
import type { IBannerRepository } from "../repositories/banner.repository.interface.js";
import type { UserBannerView } from "../types/banner.type.js";

@injectable()
export class GetBannerUserUseCase implements IGetBannerUserUseCase {
    constructor(
        @inject("IBannerRepository")
        private readonly _bannerRepository: IBannerRepository
    ) { }

    async execute(): Promise<UserBannerView[]> {
        // One banner at a time: the newest live one (older data may still have several switched on).
        const banners = await this._bannerRepository.getBannerUser();
        return banners.slice(0, 1);
    }
}
