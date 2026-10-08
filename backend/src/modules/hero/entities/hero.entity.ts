import { HERO_LIMITS, type IImage, type HeroProps } from "../types/hero.type.js";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

/** Optional text: trimmed, and an empty string stored as "not set". */
const optional = (value: string | undefined) => value?.trim() || undefined;

export class Hero {
    public readonly id: string | null;
    public readonly label?: string | undefined;
    public readonly title: string;
    public readonly subtitle: string;
    public readonly image: IImage;
    public readonly buttonLabel?: string | undefined;
    public readonly buttonUrl?: string | undefined;
    public readonly secondaryLabel?: string | undefined;
    public readonly secondaryUrl?: string | undefined;
    public readonly badgeText?: string | undefined;
    public readonly spotlightProductId?: string | undefined;
    public readonly spotlightLabel?: string | undefined;
    public readonly priority?: number | undefined;
    public readonly isActive: boolean;

    constructor(props: HeroProps) {
        const title = props.title.trim();
        const subtitle = props.subtitle.trim();

        if (!title) {
            throw new Error("Hero title cannot be empty");
        }

        if (title.length < HERO_LIMITS.titleMin || title.length > HERO_LIMITS.title) {
            throw new Error(`Hero title must be between ${HERO_LIMITS.titleMin} and ${HERO_LIMITS.title} characters`);
        }

        if (!subtitle) {
            throw new Error("Hero subtitle cannot be empty");
        }

        if (subtitle.length < HERO_LIMITS.subtitleMin || subtitle.length > HERO_LIMITS.subtitle) {
            throw new Error(`Hero subtitle must be between ${HERO_LIMITS.subtitleMin} and ${HERO_LIMITS.subtitle} characters`);
        }

        if (props.label && props.label.trim().length > HERO_LIMITS.label) {
            throw new Error(`Hero label cannot exceed ${HERO_LIMITS.label} characters`);
        }

        if (props.badgeText && props.badgeText.trim().length > HERO_LIMITS.badgeText) {
            throw new Error(`Hero badge text cannot exceed ${HERO_LIMITS.badgeText} characters`);
        }

        if (props.spotlightLabel && props.spotlightLabel.trim().length > HERO_LIMITS.spotlightLabel) {
            throw new Error(`Hero spotlight tag cannot exceed ${HERO_LIMITS.spotlightLabel} characters`);
        }

        const spotlightProductId = optional(props.spotlightProductId);
        if (spotlightProductId && !OBJECT_ID_RE.test(spotlightProductId)) {
            throw new Error("Hero spotlight product id is invalid");
        }

        const secondaryLabel = optional(props.secondaryLabel);
        const secondaryUrl = optional(props.secondaryUrl);
        if (Boolean(secondaryLabel) !== Boolean(secondaryUrl)) {
            throw new Error("Hero second link needs both text and a link");
        }

        if (!props.image || !props.image.url || !props.image.publicId) {
            throw new Error("Hero image with url and publicId is required");
        }

        this.id = props.id ?? null;
        this.label = optional(props.label);
        this.title = title;
        this.subtitle = subtitle;
        this.image = props.image;
        this.buttonLabel = optional(props.buttonLabel);
        this.buttonUrl = optional(props.buttonUrl);
        this.secondaryLabel = secondaryLabel;
        this.secondaryUrl = secondaryUrl;
        this.badgeText = optional(props.badgeText);
        this.spotlightProductId = spotlightProductId;
        // The tag only labels a spotlighted product - without one it would render nowhere.
        this.spotlightLabel = spotlightProductId ? optional(props.spotlightLabel) : undefined;
        this.priority = props.priority ?? 0;
        this.isActive = props.isActive ?? true;
    }

    activate(): Hero {
        if (this.isActive) {
            throw new Error("Hero is already active");
        }

        return new Hero({
            ...this,
            isActive: true,
        });
    }

    deactivate(): Hero {
        if (!this.isActive) {
            throw new Error("Hero is already inactive");
        }

        return new Hero({
            ...this,
            isActive: false,
        });
    }

    updateDetails(props: {
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
    }): Hero {
        return new Hero({
            ...this,
            label: props.label,
            title: props.title,
            subtitle: props.subtitle,
            image: props.image,
            buttonLabel: props.buttonLabel,
            buttonUrl: props.buttonUrl,
            secondaryLabel: props.secondaryLabel,
            secondaryUrl: props.secondaryUrl,
            badgeText: props.badgeText,
            spotlightProductId: props.spotlightProductId,
            spotlightLabel: props.spotlightLabel,
            priority: props.priority ?? this.priority,
        });
    }
}
