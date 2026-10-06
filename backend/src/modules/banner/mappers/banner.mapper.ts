import { Banner } from "../entities/banner.entity.js";
import type { BannerView, UserBannerView } from "../types/banner.type.js";

export class BannerMapper {
    static toDomain(bannerModelData: any): Banner | null {
        if (!bannerModelData) {
            return null;
        }

        const idString =
            bannerModelData._id?.toString() || bannerModelData.id?.toString();

        if (!idString) {
            console.error("Banner data from DB is missing an ID:", bannerModelData);
            return null;
        }

        return new Banner({
            id: idString,
            image: {
                url: bannerModelData.image?.url,
                publicId: bannerModelData.image?.publicId,
            },
            buttonUrl: bannerModelData.buttonUrl,
            isActive: bannerModelData.isActive,
        });
    }

    static toPersistence(bannerEntity: Banner): any {
        return {
            image: {
                url: bannerEntity.image.url,
                publicId: bannerEntity.image.publicId,
            },
            buttonUrl: bannerEntity.buttonUrl,
            isActive: bannerEntity.isActive,
        };
    }

    static toAdminView(bannerModelData: any): BannerView | null {
        if (!bannerModelData) return null;

        const id =
            bannerModelData._id?.toString() || bannerModelData.id?.toString();

        if (!id) {
            console.error("Banner data missing ID:", bannerModelData);
            return null;
        }

        return {
            id,
            image: {
                publicId: bannerModelData.image?.publicId,
                url: bannerModelData.image?.url,
            },
            buttonUrl: bannerModelData.buttonUrl,
            isActive: bannerModelData.isActive,
        };
    }

    static toUserView(bannerModelData: any): UserBannerView | null {
        if (!bannerModelData) return null;

        const id =
            bannerModelData._id?.toString() || bannerModelData.id?.toString();

        if (!id) {
            console.error("Banner data missing ID:", bannerModelData);
            return null;
        }

        return {
            id,
            image: {
                url: bannerModelData.image?.url,
            },
            buttonUrl: bannerModelData.buttonUrl,
        };
    }
}
