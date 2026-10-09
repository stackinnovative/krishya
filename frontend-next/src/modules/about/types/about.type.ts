import type { ApiResponse } from "@/shared/types/api.types";

export type AboutImage = { url: string; publicId: string };

/** Short version on the landing page ("Our Heritage") - links to the full About page. */
export type AboutTeaser = {
  eyebrow: string;
  title: string;
  summary: string;
  /** null = the storefront's bundled photo. */
  image: AboutImage | null;
  linkLabel: string;
  showOnHome: boolean;
};

export type AboutHeader = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: AboutImage | null;
};

export type AboutStory = {
  heading: string;
  paragraphs: string[];
  /** Short closing lines; line breaks are kept. */
  closing: string;
};

export type AboutStat = { value: string; label: string };

/** Founder / family tribute - shown on the About page only once it has a photo. */
export type AboutTribute = {
  image: AboutImage | null;
  quote: string;
  name: string;
  role: string;
};

/** One step of the traditional process - a real photo with a short caption. */
export type AboutCraftItem = { image: AboutImage; caption: string };

/** "The traditional way" photo row on the About page - hidden while it has no items. */
export type AboutCraft = { heading: string; items: AboutCraftItem[] };

export type AboutView = {
  id: string;
  teaser: AboutTeaser;
  header: AboutHeader;
  story: AboutStory;
  stat: AboutStat;
  tribute: AboutTribute;
  craft: AboutCraft;
};

export type UpdateAboutPayload = Omit<AboutView, "id">;

export type GetAboutResponse = ApiResponse<AboutView>;
export type UpdateAboutResponse = ApiResponse<AboutView>;
