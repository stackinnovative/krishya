import { Hero } from "../entities/hero.entity.js";
import type { HeroView, UserHeroView } from "../types/hero.type.js";

/** Stored "" (a cleared field) reads back as "not set". */
const opt = (value: unknown): string | undefined => (typeof value === "string" && value.trim() ? value : undefined);

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
            label: opt(heroModelData.label),
            title: heroModelData.title,
            subtitle: heroModelData.subtitle,
            image: {
                url: heroModelData.image?.url,
                publicId: heroModelData.image?.publicId,
            },
            buttonLabel: opt(heroModelData.buttonLabel),
            buttonUrl: opt(heroModelData.buttonUrl),
            secondaryLabel: opt(heroModelData.secondaryLabel),
            secondaryUrl: opt(heroModelData.secondaryUrl),
            badgeText: opt(heroModelData.badgeText),
            spotlightProductId: opt(heroModelData.spotlightProductId),
            spotlightLabel: opt(heroModelData.spotlightLabel),
            isActive: heroModelData.isActive,
            priority: heroModelData.priority,
        });
    }

    /** Optional fields are written as "" rather than undefined: the repository
     * updates with $set, which silently skips undefined keys - so clearing a
     * field in admin would otherwise never reach the database. */
    static toPersistence(heroEntity: Hero): any {
        return {
            label: heroEntity.label ?? "",
            title: heroEntity.title,
            subtitle: heroEntity.subtitle,
            image: {
                url: heroEntity.image.url,
                publicId: heroEntity.image.publicId,
            },
            buttonLabel: heroEntity.buttonLabel ?? "",
            buttonUrl: heroEntity.buttonUrl ?? "",
            secondaryLabel: heroEntity.secondaryLabel ?? "",
            secondaryUrl: heroEntity.secondaryUrl ?? "",
            badgeText: heroEntity.badgeText ?? "",
            spotlightProductId: heroEntity.spotlightProductId ?? "",
            spotlightLabel: heroEntity.spotlightLabel ?? "",
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
            label: opt(heroModelData.label),
            title: heroModelData.title,
            subtitle: heroModelData.subtitle,
            image: {
                publicId: heroModelData.image?.publicId,
                url: heroModelData.image?.url,
            },
            buttonLabel: opt(heroModelData.buttonLabel),
            buttonUrl: opt(heroModelData.buttonUrl),
            secondaryLabel: opt(heroModelData.secondaryLabel),
            secondaryUrl: opt(heroModelData.secondaryUrl),
            badgeText: opt(heroModelData.badgeText),
            spotlightProductId: opt(heroModelData.spotlightProductId),
            spotlightLabel: opt(heroModelData.spotlightLabel),
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
            label: opt(heroModelData.label),
            title: heroModelData.title,
            subtitle: heroModelData.subtitle,
            image: {
                url: heroModelData.image?.url,
            },
            buttonLabel: opt(heroModelData.buttonLabel),
            buttonUrl: opt(heroModelData.buttonUrl),
            secondaryLabel: opt(heroModelData.secondaryLabel),
            secondaryUrl: opt(heroModelData.secondaryUrl),
            badgeText: opt(heroModelData.badgeText),
            spotlightProductId: opt(heroModelData.spotlightProductId),
            spotlightLabel: opt(heroModelData.spotlightLabel),
            priority: heroModelData.priority,
        };
    }
}
