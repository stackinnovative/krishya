import { About, ABOUT_DEFAULTS } from "../entities/about.entity.js";
import type { AboutView, IImage } from "../types/about.type.js";

type StoredImage = { url?: string | null; publicId?: string | null } | null | undefined;

/** Shape of a raw (lean) About document - every block optional, since a
 * document written before a field existed simply doesn't have it. */
export type AboutRecord = {
    _id?: { toString(): string } | string;
    id?: string;
    teaser?: Partial<Record<"eyebrow" | "title" | "summary" | "linkLabel", string>> & { image?: StoredImage; showOnHome?: boolean };
    header?: Partial<Record<"eyebrow" | "title" | "subtitle", string>> & { image?: StoredImage };
    story?: { heading?: string; paragraphs?: string[]; closing?: string };
    stat?: { value?: string; label?: string };
    tribute?: Partial<Record<"quote" | "name" | "role", string>> & { image?: StoredImage };
};

const toImage = (image: StoredImage): IImage | null => (image?.url && image.publicId ? { url: image.url, publicId: image.publicId } : null);

export class AboutMapper {
    static toDomain(record: AboutRecord | null | undefined): About | null {
        if (!record) return null;

        const id = record._id?.toString() || record.id;
        if (!id) {
            console.error("About data from DB is missing an ID:", record);
            return null;
        }

        const D = ABOUT_DEFAULTS;
        const { teaser = {}, header = {}, story = {}, stat = {}, tribute = {} } = record;

        return new About({
            id,
            teaser: {
                eyebrow: teaser.eyebrow ?? D.teaser.eyebrow,
                title: teaser.title ?? D.teaser.title,
                summary: teaser.summary ?? D.teaser.summary,
                image: toImage(teaser.image),
                linkLabel: teaser.linkLabel ?? D.teaser.linkLabel,
                showOnHome: teaser.showOnHome ?? D.teaser.showOnHome,
            },
            header: {
                eyebrow: header.eyebrow ?? D.header.eyebrow,
                title: header.title ?? D.header.title,
                subtitle: header.subtitle ?? D.header.subtitle,
                image: toImage(header.image),
            },
            story: {
                heading: story.heading ?? D.story.heading,
                paragraphs: story.paragraphs?.length ? story.paragraphs : D.story.paragraphs,
                closing: story.closing ?? D.story.closing,
            },
            stat: {
                value: stat.value ?? D.stat.value,
                label: stat.label ?? D.stat.label,
            },
            tribute: {
                image: toImage(tribute.image),
                quote: tribute.quote ?? D.tribute.quote,
                name: tribute.name ?? D.tribute.name,
                role: tribute.role ?? D.tribute.role,
            },
        });
    }

    static toPersistence(entity: About): Omit<AboutView, "id"> {
        return {
            teaser: entity.teaser,
            header: entity.header,
            story: entity.story,
            stat: entity.stat,
            tribute: entity.tribute,
        };
    }

    static toView(entity: About): AboutView {
        return {
            id: entity.id ?? "",
            teaser: entity.teaser,
            header: entity.header,
            story: entity.story,
            stat: entity.stat,
            tribute: entity.tribute,
        };
    }
}
