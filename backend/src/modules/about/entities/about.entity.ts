import {
    ABOUT_LIMITS,
    type AboutHeader,
    type AboutProps,
    type AboutStat,
    type AboutStory,
    type AboutTeaser,
    type AboutTribute,
    type AboutCraft,
    type IImage,
} from "../types/about.type.js";

/**
 * The single canonical default content (the client's own story) - the
 * mongoose schema imports this same object for its defaults, so a brand-new
 * store and a store whose document predates a field both read the same copy.
 */
export const ABOUT_DEFAULTS: Omit<AboutProps, "id"> = {
    teaser: {
        eyebrow: "Our Heritage",
        title: "A legacy nurtured through generations",
        summary:
            "Krishay Ayurveda comes from the house of Cochin Arya Vaidyasala, founded in Kochi in 1948. A few of its formulations, handpicked and reimagined for today - still rooted in the wisdom of Ayurveda.",
        image: null,
        linkLabel: "Read Our Story",
        showOnHome: true,
    },
    header: {
        eyebrow: "Our Story",
        title: "A Legacy, Reimagined",
        subtitle: "From the House of Cochin Arya Vaidyasala",
        image: null,
    },
    story: {
        heading: "Where our story begins",
        paragraphs: [
            "The story of Krishay Ayurveda begins with a legacy that has been nurtured through generations.",
            "Cochin Arya Vaidyasala was founded in 1948 by the late Arya Vaidyan and Ayurveda Professor Sri. Ochilath K. I. Krishnan Vaidyan, who was introduced to the science of Ayurveda by his father, Sri. Kochappan Ayappan, a renowned Ayurveda scholar and physician.",
            "For decades, this legacy was carried forward by his younger son, Dr. T. K. Ravi, an Ayurvedic physician, whose dedication and expertise continued to shape the institution.",
            "Today, Cochin Arya Vaidyasala carries a heritage of over 600 Ayurvedic products and formulations.",
            "Krishay Ayurveda is our way of carrying that legacy forward. From the house of Cochin Arya Vaidyasala, Krishay is a carefully curated collection - a few formulations thoughtfully handpicked, fine-tuned and reimagined with a premium, contemporary approach, while remaining rooted in the wisdom and traditions of Ayurveda.",
            "Each product is a continuation of a story that began generations ago.",
        ],
        closing: "A legacy we honour.\nA tradition we continue.",
    },
    stat: {
        value: "75+",
        label: "years of Ayurvedic tradition in Kerala",
    },
    tribute: {
        image: null,
        quote: "Etched in our hearts forever, your life is a legacy that will guide generations to come.",
        name: "",
        role: "",
    },
    // No stock photos: the row stays hidden until the store uploads its own.
    craft: {
        heading: "The traditional way",
        items: [],
    },
};

const fitText = (value: string, field: string, max: number, min = 0): string => {
    const text = value.trim();
    if (text.length < min) {
        throw new Error(min === 1 ? `About ${field} cannot be empty` : `About ${field} must be at least ${min} characters`);
    }
    if (text.length > max) {
        throw new Error(`About ${field} cannot exceed ${max} characters`);
    }
    return text;
};

const checkImage = (image: IImage | null, field: string): IImage | null => {
    if (image && (!image.url || !image.publicId)) {
        throw new Error(`About ${field} image must have both a url and a publicId`);
    }
    return image ?? null;
};

/** Every Cloudinary id the content currently references. */
const imageIds = (props: Pick<AboutProps, "teaser" | "header" | "tribute" | "craft">): string[] =>
    [props.teaser.image, props.header.image, props.tribute.image, ...props.craft.items.map((item) => item.image)]
        .filter((i): i is IImage => i !== null)
        .map((i) => i.publicId);

/**
 * About page content is a singleton (one document for the whole store), like
 * business settings: no list, no activate/deactivate, no delete - only read
 * and replace. The landing page shows the short `teaser`; the About page shows
 * the rest.
 */
export class About {
    public readonly id: string | null;
    public readonly teaser: AboutTeaser;
    public readonly header: AboutHeader;
    public readonly story: AboutStory;
    public readonly stat: AboutStat;
    public readonly tribute: AboutTribute;
    public readonly craft: AboutCraft;

    constructor(props: AboutProps) {
        const L = ABOUT_LIMITS;

        const paragraphs = props.story.paragraphs.map((p) => p.trim()).filter(Boolean);
        if (paragraphs.length < L.paragraphsMin || paragraphs.length > L.paragraphsMax) {
            throw new Error(`About story must have between ${L.paragraphsMin} and ${L.paragraphsMax} paragraphs`);
        }
        paragraphs.forEach((p, i) => fitText(p, `story paragraph ${i + 1}`, L.paragraph, 1));

        this.id = props.id ?? null;
        this.teaser = {
            eyebrow: fitText(props.teaser.eyebrow, "teaser eyebrow", L.eyebrow),
            title: fitText(props.teaser.title, "teaser title", L.title, 1),
            summary: fitText(props.teaser.summary, "teaser summary", L.summary, L.summaryMin),
            image: checkImage(props.teaser.image, "teaser"),
            linkLabel: fitText(props.teaser.linkLabel, "teaser link text", L.linkLabel, 1),
            showOnHome: props.teaser.showOnHome,
        };
        this.header = {
            eyebrow: fitText(props.header.eyebrow, "page eyebrow", L.eyebrow),
            title: fitText(props.header.title, "page title", L.title, 1),
            subtitle: fitText(props.header.subtitle, "page subtitle", L.subtitle),
            image: checkImage(props.header.image, "page header"),
        };
        this.story = {
            heading: fitText(props.story.heading, "story heading", L.heading, 1),
            paragraphs,
            closing: fitText(props.story.closing, "story closing lines", L.closing),
        };
        this.stat = {
            value: fitText(props.stat.value, "stat value", L.statValue),
            label: fitText(props.stat.label, "stat label", L.statLabel),
        };
        if (Boolean(this.stat.value) !== Boolean(this.stat.label)) {
            throw new Error("About stat needs both a value and a label, or neither");
        }
        this.tribute = {
            image: checkImage(props.tribute.image, "tribute"),
            quote: fitText(props.tribute.quote, "tribute quote", L.quote),
            name: fitText(props.tribute.name, "tribute name", L.name),
            role: fitText(props.tribute.role, "tribute role", L.role),
        };

        if (props.craft.items.length > L.craftItemsMax) {
            throw new Error(`About craft row can have at most ${L.craftItemsMax} photos`);
        }
        this.craft = {
            heading: fitText(props.craft.heading, "craft heading", L.craftHeading, 1),
            items: props.craft.items.map((item, i) => {
                const image = checkImage(item.image, `craft photo ${i + 1}`);
                if (!image) throw new Error(`About craft photo ${i + 1} needs an image`);
                return { image, caption: fitText(item.caption, `craft caption ${i + 1}`, L.craftCaption, 1) };
            }),
        };
    }

    /** Cloudinary ids this content referenced that `next` no longer uses - safe to delete once `next` is saved. */
    replacedImageIds(next: About): string[] {
        const kept = new Set(imageIds(next));
        return imageIds(this).filter((id) => !kept.has(id));
    }
}
