export type IImage = {
    url: string;
    publicId: string;
};

/**
 * Text limits shared by the DTO and the entity. Sized so every block still
 * fits its storefront slot (the home teaser card, the About header) on a phone.
 */
export const ABOUT_LIMITS = {
    eyebrow: 40,
    title: 100,
    subtitle: 160,
    summaryMin: 20,
    summary: 300,
    linkLabel: 30,
    heading: 80,
    paragraph: 600,
    paragraphsMin: 1,
    paragraphsMax: 8,
    closing: 200,
    statValue: 12,
    statLabel: 60,
    quote: 300,
    name: 60,
    role: 80,
    craftHeading: 80,
    craftCaption: 60,
    craftItemsMax: 6,
} as const;

/** Short version on the landing page ("Our Heritage" section) - links to the full About page. */
export type AboutTeaser = {
    eyebrow: string;
    title: string;
    summary: string;
    /** null = use the storefront's bundled photo. */
    image: IImage | null;
    linkLabel: string;
    showOnHome: boolean;
};

export type AboutHeader = {
    eyebrow: string;
    title: string;
    subtitle: string;
    image: IImage | null;
};

export type AboutStory = {
    heading: string;
    paragraphs: string[];
    /** Short closing lines under the story; line breaks are kept. */
    closing: string;
};

export type AboutStat = {
    value: string;
    label: string;
};

/** Optional tribute to the founder / family - only shown on the storefront once a photo is set. */
export type AboutTribute = {
    image: IImage | null;
    quote: string;
    name: string;
    role: string;
};

/** One step of the traditional process - a real photo with a short caption. */
export type AboutCraftItem = {
    image: IImage;
    caption: string;
};

/** "The traditional way" photo row on the About page - hidden while it has no items. */
export type AboutCraft = {
    heading: string;
    items: AboutCraftItem[];
};

export type AboutProps = {
    id?: string | null;
    teaser: AboutTeaser;
    header: AboutHeader;
    story: AboutStory;
    stat: AboutStat;
    tribute: AboutTribute;
    craft: AboutCraft;
};

export type AboutView = {
    id: string;
    teaser: AboutTeaser;
    header: AboutHeader;
    story: AboutStory;
    stat: AboutStat;
    tribute: AboutTribute;
    craft: AboutCraft;
};
