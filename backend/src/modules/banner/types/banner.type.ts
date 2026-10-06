export type IImage = {
    url: string;
    publicId: string;
};

export type BannerProps = {
    id?: string | null;
    image: IImage;
    buttonUrl?: string | undefined;
    isActive?: boolean;
};

export type BannerView = {
    id: string;
    image: IImage;
    buttonUrl?: string | undefined;
    isActive: boolean;
};

export type UserBannerView = {
    id: string;
    image: {
        url: string;
    };
    buttonUrl?: string | undefined;
};
