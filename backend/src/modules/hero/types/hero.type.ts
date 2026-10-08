/** Text limits shared by the DTO and the entity - sized so every field still fits the storefront hero without overflowing on a phone. */
export const HERO_LIMITS = {
    label: 40,
    titleMin: 2,
    title: 60,
    subtitleMin: 5,
    subtitle: 160,
    buttonLabel: 24,
    url: 300,
    badgeText: 28,
    spotlightLabel: 20,
} as const;

export type IImage = {
    url: string;
    publicId: string;
};

export type HeroProps = {
    id?: string | null;
    label?: string | undefined;
    title: string;
    subtitle: string;
    image: IImage;
    buttonLabel?: string | undefined;
    buttonUrl?: string | undefined;
    secondaryLabel?: string | undefined;
    secondaryUrl?: string | undefined;
    badgeText?: string | undefined;
    spotlightProductId?: string | undefined;
    spotlightLabel?: string | undefined;
    priority?: number | undefined;
    isActive?: boolean;
};

export type HeroView = {
    id: string;
    label?: string | undefined;
    title: string;
    subtitle: string;
    image: IImage;
    buttonLabel?: string | undefined;
    buttonUrl?: string | undefined;
    secondaryLabel?: string | undefined;
    secondaryUrl?: string | undefined;
    badgeText?: string | undefined;
    spotlightProductId?: string | undefined;
    spotlightLabel?: string | undefined;
    priority?: number | undefined;
    isActive: boolean;
};

export type UserHeroView = {
    id: string;
    label?: string | undefined;
    title: string;
    subtitle: string;
    image: {
        url: string;
    };
    buttonLabel?: string | undefined;
    buttonUrl?: string | undefined;
    secondaryLabel?: string | undefined;
    secondaryUrl?: string | undefined;
    badgeText?: string | undefined;
    spotlightProductId?: string | undefined;
    spotlightLabel?: string | undefined;
    priority?: number | undefined;
};
