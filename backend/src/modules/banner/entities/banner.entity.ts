import type { IImage, BannerProps } from "../types/banner.type.js";

export class Banner {
    public readonly id: string | null;
    public readonly image: IImage;
    public readonly buttonUrl?: string | undefined;
    public readonly isActive: boolean;

    constructor(props: BannerProps) {
        if (!props.image || !props.image.url || !props.image.publicId) {
            throw new Error("Banner image with url and publicId is required");
        }

        this.id = props.id ?? null;
        this.image = props.image;
        this.buttonUrl = props.buttonUrl?.trim() || undefined;
        this.isActive = props.isActive ?? true;
    }

    activate(): Banner {
        if (this.isActive) {
            throw new Error("Banner is already active");
        }

        return new Banner({
            ...this,
            isActive: true,
        });
    }

    deactivate(): Banner {
        if (!this.isActive) {
            throw new Error("Banner is already inactive");
        }

        return new Banner({
            ...this,
            isActive: false,
        });
    }

    updateDetails(props: {
        image: IImage;
        buttonUrl?: string | undefined;
    }): Banner {
        return new Banner({
            ...this,
            image: props.image,
            buttonUrl: props.buttonUrl,
        });
    }
}
