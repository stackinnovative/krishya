import { Banner } from "../entities/banner.entity.js";
import type { BannerView, UserBannerView } from "../types/banner.type.js";

export interface IBannerRepository {
    create(bannerEntity: Banner): Promise<Banner>;
    findById(id: string): Promise<Banner | null>;
    findAll(): Promise<Banner[]>;
    save(bannerEntity: Banner): Promise<Banner>;
    delete(id: string): Promise<void>;
    getBannerUser(): Promise<UserBannerView[]>;
    getBannerAdmin(): Promise<BannerView[]>;
}
