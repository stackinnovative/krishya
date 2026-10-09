import type { ImageFieldValue } from "@/modules/admin-shell/components/ImageDropzone";
import { ABOUT_LIMITS as L } from "./constants";
import type { AboutHeader, AboutImage, AboutTeaser, AboutTribute, AboutView, UpdateAboutPayload } from "./types/about.type";

/** Editor working copy: same shape as the content, but photos may still be a
 * cropped-not-yet-uploaded `PendingImage` (uploaded only on Save). */
export type AboutDraft = {
  teaser: Omit<AboutTeaser, "image"> & { image: ImageFieldValue | null };
  header: Omit<AboutHeader, "image"> & { image: ImageFieldValue | null };
  story: { heading: string; paragraphs: string[]; closing: string };
  stat: { value: string; label: string };
  tribute: Omit<AboutTribute, "image"> & { image: ImageFieldValue | null };
};

export type ImageSlot = "teaser" | "header" | "tribute";

export const toDraft = (about: AboutView): AboutDraft => ({
  teaser: { ...about.teaser },
  header: { ...about.header },
  story: { ...about.story, paragraphs: about.story.paragraphs.length ? [...about.story.paragraphs] : [""] },
  stat: { ...about.stat },
  tribute: { ...about.tribute },
});

/** Error keys use the backend's dotted paths ("teaser.summary", "story.paragraphs.2"), so server and client errors land in the same place. */
export type AboutErrors = Record<string, string>;

const len = (s: string) => s.trim().length;

/** Same rules as UpdateAboutSchema in the backend DTO. */
export const validateAbout = (d: AboutDraft): AboutErrors => {
  const e: AboutErrors = {};
  const max = (key: string, value: string, limit: number, label: string) => {
    if (len(value) > limit) e[key] = `${label} cannot exceed ${limit} characters.`;
  };
  const required = (key: string, value: string, label: string) => {
    if (!len(value)) e[key] = `${label} is required.`;
  };

  max("teaser.eyebrow", d.teaser.eyebrow, L.eyebrow, "Eyebrow text");
  required("teaser.title", d.teaser.title, "Title");
  max("teaser.title", d.teaser.title, L.title, "Title");
  if (len(d.teaser.summary) < L.summaryMin) e["teaser.summary"] = `Short summary needs at least ${L.summaryMin} characters.`;
  max("teaser.summary", d.teaser.summary, L.summary, "Short summary");
  required("teaser.linkLabel", d.teaser.linkLabel, "Link text");
  max("teaser.linkLabel", d.teaser.linkLabel, L.linkLabel, "Link text");

  max("header.eyebrow", d.header.eyebrow, L.eyebrow, "Eyebrow text");
  required("header.title", d.header.title, "Page title");
  max("header.title", d.header.title, L.title, "Page title");
  max("header.subtitle", d.header.subtitle, L.subtitle, "Subtitle");

  required("story.heading", d.story.heading, "Story heading");
  max("story.heading", d.story.heading, L.heading, "Story heading");
  if (d.story.paragraphs.length < L.paragraphsMin) e["story.paragraphs"] = "Add at least one story paragraph.";
  if (d.story.paragraphs.length > L.paragraphsMax) e["story.paragraphs"] = `The story can have at most ${L.paragraphsMax} paragraphs.`;
  d.story.paragraphs.forEach((p, i) => {
    if (!len(p)) e[`story.paragraphs.${i}`] = "Write this paragraph or remove it.";
    else max(`story.paragraphs.${i}`, p, L.paragraph, "Paragraph");
  });
  max("story.closing", d.story.closing, L.closing, "Closing lines");

  max("stat.value", d.stat.value, L.statValue, "Stat value");
  max("stat.label", d.stat.label, L.statLabel, "Stat label");
  if (len(d.stat.value) && !len(d.stat.label)) e["stat.label"] = "Add a label for the stat, or clear its value.";
  if (len(d.stat.label) && !len(d.stat.value)) e["stat.value"] = "Add a value for the stat, or clear its label.";

  max("tribute.quote", d.tribute.quote, L.quote, "Quote");
  max("tribute.name", d.tribute.name, L.name, "Name");
  max("tribute.role", d.tribute.role, L.role, "Role");

  return e;
};

/** Server paths like "teaser.image.url" belong to the "teaser.image" field. */
export const toFieldErrors = (apiErrors: Record<string, string>): AboutErrors =>
  Object.fromEntries(Object.entries(apiErrors).map(([path, message]) => [path.replace(/\.(url|publicId)$/, ""), message]));

const t = (s: string) => s.trim();

/** Trimmed payload once every photo is uploaded (`images` holds the resolved ones). */
export const toPayload = (d: AboutDraft, images: Record<ImageSlot, AboutImage | null>): UpdateAboutPayload => ({
  teaser: {
    eyebrow: t(d.teaser.eyebrow),
    title: t(d.teaser.title),
    summary: t(d.teaser.summary),
    image: images.teaser,
    linkLabel: t(d.teaser.linkLabel),
    showOnHome: d.teaser.showOnHome,
  },
  header: { eyebrow: t(d.header.eyebrow), title: t(d.header.title), subtitle: t(d.header.subtitle), image: images.header },
  story: { heading: t(d.story.heading), paragraphs: d.story.paragraphs.map(t), closing: t(d.story.closing) },
  stat: { value: t(d.stat.value), label: t(d.stat.label) },
  tribute: { image: images.tribute, quote: t(d.tribute.quote), name: t(d.tribute.name), role: t(d.tribute.role) },
});

