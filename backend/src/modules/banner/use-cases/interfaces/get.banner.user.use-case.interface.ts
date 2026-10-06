import type { UserBannerView } from "../../types/banner.type.js";

export interface IGetBannerUserUseCase {
    execute(): Promise<UserBannerView[]>;
}

