/** Locked crop ratios shared by the admin crop tool, every admin thumbnail,
 * and the live storefront. If a display spot doesn't render at exactly this
 * ratio, the browser (or Cloudinary's own c_fill transform) silently
 * re-crops the already-cropped image again to fit its box - so anything
 * showing this image MUST size itself from these constants, never a
 * hardcoded height/width pair, or "what the admin cropped" stops matching
 * "what customers see". */
export const HERO_ASPECT_RATIO = 16 / 9;
export const BANNER_ASPECT_RATIO = 21 / 6;

/** Mirrors MAX_BANNERS in backend/src/modules/banner/use-cases/create.banner.use-case.ts -
 * adding a 4th banner there auto-deletes the oldest, so this is a display hint, not enforcement. */
export const MAX_BANNERS = 3;
