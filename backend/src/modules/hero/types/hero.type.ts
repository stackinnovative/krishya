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
    priority?: number | undefined;
    isActive: boolean;
};

export type UserHeroView = {
    id: string;
    label?: string;
    title: string;
    subtitle: string;
    image: {
        url: string;
    };
    buttonLabel?: string;
    buttonUrl?: string;
    priority?: number;
};
