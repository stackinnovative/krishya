/** Locked crop ratios shared by the admin crop tool, every admin thumbnail,
 * and the live storefront. If a display spot doesn't render at exactly this
 * ratio, the browser (or Cloudinary's own c_fill transform) silently
 * re-crops the already-cropped image again to fit its box - so anything
 * showing this image MUST size itself from these constants, never a
 * hardcoded height/width pair, or "what the admin cropped" stops matching
 * "what customers see". */
/** Portrait: the storefront hero shows its photo in a tall arch. */
export const HERO_ASPECT_RATIO = 4 / 5;
export const BANNER_ASPECT_RATIO = 21 / 6;

/** Mirrors MAX_BANNERS in backend/src/modules/banner/use-cases/create.banner.use-case.ts - the
 * backend refuses a 4th banner. Only one of them is live on the home page at a time. */
export const MAX_BANNERS = 3;

/** Mirrors HERO_LIMITS in backend/src/modules/hero/types/hero.type.ts - sized so
 * every field still fits the storefront hero on a phone without overflowing. */
export const HERO_LIMITS = {
  label: 40,
  titleMin: 2,
  title: 60,
  subtitleMin: 5,
  subtitle: 160,
  buttonLabel: 24,
  url: 300,
  badgeText: 28,
  spotlightLabel: 20,
} as const;

/** How long each hero slide stays up before the slideshow advances. */
export const HERO_SLIDE_INTERVAL_MS = 6500;
