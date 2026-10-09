import { ABOUT_DEFAULTS } from "../entities/about.entity.js";
import type { AboutProps, IImage } from "../types/about.type.js";

/** A deep copy of the default content, so a test can tweak it freely. */
export const aboutInput = (): Omit<AboutProps, "id"> => structuredClone(ABOUT_DEFAULTS);

export const image = (publicId: string): IImage => ({ url: `https://res.cloudinary.com/demo/image/upload/${publicId}.jpg`, publicId });
