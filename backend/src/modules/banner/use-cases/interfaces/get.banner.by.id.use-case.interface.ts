import type { BannerView } from "../../types/banner.type.js";

export interface IGetBannerByIdUseCase {
    execute(id: string): Promise<BannerView>;
}