/** Joining words kept lowercase mid-name: "Oil for Hair", not "Oil For Hair". */
const MINOR_WORDS = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"]);

/**
 * "NEELIBRINGADI hair-oil  200ML" -> "Neelibringadi Hair-Oil 200ml".
 * Collapses spaces, lowercases everything, then capitalises the first letter
 * of each word (and each hyphen/slash part). Words starting with a digit stay
 * lowercase, so sizes like "200ml" are left alone.
 */
export const toTitleCase = (text: string): string =>
    text
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase()
        .split(" ")
        .map((word, i) =>
            i > 0 && MINOR_WORDS.has(word)
                ? word
                : word.replace(/(^|[-/(])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase()),
        )
        .join(" ");
