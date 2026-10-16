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
