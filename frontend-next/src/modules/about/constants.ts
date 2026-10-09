import type { AboutView } from "./types/about.type";

/** Mirrors ABOUT_LIMITS in backend/src/modules/about/types/about.type.ts. */
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

/** Crop ratios - each matches the box the photo fills on the storefront. */
export const ABOUT_TEASER_RATIO = 5 / 6;
export const ABOUT_HEADER_RATIO = 16 / 7;
export const ABOUT_TRIBUTE_RATIO = 4 / 5;
export const ABOUT_CRAFT_RATIO = 4 / 5;

/** Bundled photos used until admin uploads their own. */
export const ABOUT_FALLBACK_IMAGES = {
  teaser: "/images/heritage.jpg",
  header: "/images/hero-oil-herbs.jpg",
} as const;

/**
 * Same copy as ABOUT_DEFAULTS in the backend entity. The backend always
 * returns content (it seeds these defaults), so this is only used if the API
 * can't be reached - the landing and About pages then still read in full
 * instead of rendering empty.
 */
export const ABOUT_FALLBACK: AboutView = {
  id: "",
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
  stat: { value: "75+", label: "years of Ayurvedic tradition in Kerala" },
  tribute: {
    image: null,
    quote: "Etched in our hearts forever, your life is a legacy that will guide generations to come.",
    name: "",
    role: "",
  },
  craft: { heading: "The traditional way", items: [] },
};
