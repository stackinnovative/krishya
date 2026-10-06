import type { BannerView } from "../../types/banner.type.js";

export interface IGetBannerAdminUseCase {
    execute(): Promise<BannerView[]>;
}