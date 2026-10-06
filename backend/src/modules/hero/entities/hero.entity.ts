import type { IImage, HeroProps } from "../types/hero.type.js";

export class Hero {
    public readonly id: string | null;
    public readonly label?: string | undefined;
    public readonly title: string;
    public readonly subtitle: string;
    public readonly image: IImage;
    public readonly buttonLabel?: string | undefined;
    public readonly buttonUrl?: string | undefined;
    public readonly priority?: number | undefined;
    public readonly isActive: boolean;

    constructor(props: HeroProps) {
        const title = props.title.trim();
        const subtitle = props.subtitle.trim();

        if (!title) {
            throw new Error("Hero title cannot be empty");
        }

        if (title.length < 2 || title.length > 100) {
            throw new Error("Hero title must be between 2 and 100 characters");
        }

        if (!subtitle) {
            throw new Error("Hero subtitle cannot be empty");
        }

        if (subtitle.length < 5 || subtitle.length > 200) {
            throw new Error("Hero subtitle must be between 5 and 200 characters");
        }

        if (props.label && props.label.trim().length > 40) {
            throw new Error("Hero label cannot exceed 40 characters");
        }

        if (!props.image || !props.image.url || !props.image.publicId) {
            throw new Error("Hero image with url and publicId is required");
        }

        this.id = props.id ?? null;
        this.label = props.label?.trim() || undefined;
        this.title = title;
        this.subtitle = subtitle;
        this.image = props.image;
        this.buttonLabel = props.buttonLabel?.trim() || undefined;
        this.buttonUrl = props.buttonUrl?.trim() || undefined;
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
            priority: props.priority ?? this.priority,
        });
    }
}
