import { injectable } from "tsyringe";
import type { IBannerRepository } from "./banner.repository.interface.js";
import { Banner } from "../entities/banner.entity.js";
import { BannerModel } from "../infrastructure/banner.schema.js";
import { BannerMapper } from "../mappers/banner.mapper.js";
import type { BannerView, UserBannerView } from "../types/banner.type.js";

@injectable()
export class BannerRepository implements IBannerRepository {
    async create(bannerEntity: Banner): Promise<Banner> {
        const persistenceData = BannerMapper.toPersistence(bannerEntity);
        const createdBanner = await BannerModel.create(persistenceData);
        return BannerMapper.toDomain(createdBanner)!;
    }

    async findById(id: string): Promise<Banner | null> {
        const banner = await BannerModel.findById(id).lean();
        if (!banner) return null;
        return BannerMapper.toDomain(banner);
    }

    async findAll(): Promise<Banner[]> {
        const banners = await BannerModel.find().sort({ createdAt: 1 }).lean();
        return banners
            .map((banner) => BannerMapper.toDomain(banner))
            .filter((banner): banner is Banner => banner !== null);
    }

    async save(bannerEntity: Banner): Promise<Banner> {
        const { id } = bannerEntity;
        if (!id) {
            throw new Error("Cannot save banner without an ID");
        }

        const persistenceData = BannerMapper.toPersistence(bannerEntity);
        const updatedBanner = await BannerModel.findByIdAndUpdate(
            id,
            { $set: persistenceData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedBanner) {
            throw new Error("Banner not found for update");
        }

        return BannerMapper.toDomain(updatedBanner)!;
    }

    async delete(id: string): Promise<void> {
        await BannerModel.findByIdAndDelete(id);
    }

    async deactivateAllExcept(id: string): Promise<void> {
        await BannerModel.updateMany({ _id: { $ne: id }, isActive: true }, { $set: { isActive: false } });
    }

    async getBannerUser(): Promise<UserBannerView[]> {
        const banners = await BannerModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();
        return banners
            .map((banner) => BannerMapper.toUserView(banner))
            .filter((banner): banner is UserBannerView => banner !== null);
    }

    async getBannerAdmin(): Promise<BannerView[]> {
        const banners = await BannerModel.find().sort({ createdAt: -1 }).lean();
        return banners
            .map((banner) => BannerMapper.toAdminView(banner))
            .filter((banner): banner is BannerView => banner !== null);
    }
}
