import { Hero } from "../entities/hero.entity.js";
import type { HeroView, UserHeroView } from "../types/hero.type.js";

export class HeroMapper {
    static toDomain(heroModelData: any): Hero | null {
        if (!heroModelData) {
            return null;
        }

        const idString =
            heroModelData._id?.toString() || heroModelData.id?.toString();

        if (!idString) {
            console.error("Hero data from DB is missing an ID:", heroModelData);
            return null;
        }

        return new Hero({
            id: idString,
            label: heroModelData.label,
            title: heroModelData.title,
            subtitle: heroModelData.subtitle,
            image: {
                url: heroModelData.image?.url,
                publicId: heroModelData.image?.publicId,
            },
            buttonLabel: heroModelData.buttonLabel,
            buttonUrl: heroModelData.buttonUrl,
            isActive: heroModelData.isActive,
            priority: heroModelData.priority,
        });
    }

    static toPersistence(heroEntity: Hero): any {
        return {
            label: heroEntity.label,
            title: heroEntity.title,
            subtitle: heroEntity.subtitle,
            image: {
                url: heroEntity.image.url,
                publicId: heroEntity.image.publicId,
            },
            buttonLabel: heroEntity.buttonLabel,
            buttonUrl: heroEntity.buttonUrl,
            priority: heroEntity.priority,
            isActive: heroEntity.isActive,
        };
    }

    static toAdminView(heroModelData: any): HeroView | null {
        if (!heroModelData) return null;

        const id =
            heroModelData._id?.toString() || heroModelData.id?.toString();

        if (!id) {
            console.error("Hero data missing ID:", heroModelData);
            return null;
        }

        return {
            id,
            label: heroModelData.label,
            title: heroModelData.title,
            subtitle: heroModelData.subtitle,
            image: {
                publicId: heroModelData.image?.publicId,
                url: heroModelData.image?.url,
            },
            buttonLabel: heroModelData.buttonLabel,
            buttonUrl: heroModelData.buttonUrl,
            priority: heroModelData.priority,
            isActive: heroModelData.isActive,
        };
    }

    static toUserView(heroModelData: any): UserHeroView | null {
        if (!heroModelData) return null;

        const id =
            heroModelData._id?.toString() || heroModelData.id?.toString();

        if (!id) {
            console.error("Hero data missing ID:", heroModelData);
            return null;
        }

        return {
            id,
            label: heroModelData.label,
            title: heroModelData.title,
            subtitle: heroModelData.subtitle,
            image: {
                url: heroModelData.image?.url,
            },
            buttonLabel: heroModelData.buttonLabel,
            buttonUrl: heroModelData.buttonUrl,
            priority: heroModelData.priority,
        };
    }
}
