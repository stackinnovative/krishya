/** "Karkidakam: Monsoon Care!" -> "karkidakam-monsoon-care". Accents are dropped, never kept as odd characters. */
export const toSlug = (text: string, maxLength: number): string =>
    text
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, maxLength)
        .replace(/-+$/, "");

/**
 * A slug built from `text` that `isTaken` says is free: "hair-care", or
 * "hair-care-2", "hair-care-3"... when another document already owns it.
 * Leaves room for the suffix so the result still fits in `maxLength`.
 */
export const toUniqueSlug = async (
    text: string,
    maxLength: number,
    isTaken: (slug: string) => Promise<boolean>,
): Promise<string> => {
    const base = toSlug(text, maxLength - 4);
    let slug = base;
    for (let n = 2; await isTaken(slug); n++) {
        slug = `${base}-${n}`;
    }
    return slug;
};
