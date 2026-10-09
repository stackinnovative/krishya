import type { About } from "../entities/about.entity.js";

export interface IAboutRepository {
    /** Always resolves to a value - creates the singleton document with the
     * default story the first time it's read, so the storefront always has content. */
    getAbout(): Promise<About>;
    updateAbout(aboutEntity: About): Promise<About>;
}
