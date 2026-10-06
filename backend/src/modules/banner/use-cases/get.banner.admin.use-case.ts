import { inject, injectable } from "tsyringe";
import type { IGetBannerAdminUseCase } from "./interfaces/get.banner.admin.use-case.interface.js";
import type { IBannerRepository } from "../repositories/banner.repository.interface.js";
import type { BannerView } from "../types/banner.type.js";

@injectable()
export class GetBannerAdminUseCase implements IGetBannerAdminUseCase {
    constructor(
        @inject("IBannerRepository")
        private readonly _bannerRepository: IBannerRepository
    ) { }

    async execute(): Promise<BannerView[]> {
        const banner = await this._bannerRepository.getBannerAdmin();
        return banner;
    }
}   