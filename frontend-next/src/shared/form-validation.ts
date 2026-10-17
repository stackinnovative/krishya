import { useState } from "react";

/** Letters and combining marks (any language - incl. Devanagari/Tamil/Arabic
 * vowel signs, which are Unicode "marks" rather than "letters") plus
 * numbers, whitespace, and the handful of punctuation marks that show up in
 * real names/headlines - apostrophes, hyphens, ampersands, basic sentence
 * punctuation. Used to flag keyboard-mash symbols like * ^ $ # @ < > with a
 * validation error - see `containsSpecialChars` below. Not "g" flagged:
 * callers run `.test()` on this repeatedly across fields, and a global regex
 * keeps stale lastIndex state between calls, silently skipping matches. */
const SPECIAL_CHARS_PATTERN = /[^\p{L}\p{M}\p{N}\s.,'!?&()-]/u;

/** True if `value` has a character outside the safe set above - use to flag
 * free-form text (names, headlines, descriptions, quotes) as invalid on save.
 * Not meant for url/email/tel, which follow their own formats. */
export const containsSpecialChars = (value: unknown): boolean =>
  typeof value === "string" && SPECIAL_CHARS_PATTERN.test(value);

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBlank = (value: unknown) =>
  value === undefined || value === null || (typeof value === "number" ? Number.isNaN(value) : String(value).trim() === "");

/** One field's rules for `validateFields`. Checks run in order and stop at the first failure. */
export interface FieldRule<V> {
  key: string;
  label: string;
  required?: boolean;
  /** Overrides the default blank check (e.g. an image field is empty when it's null). */
  isEmpty?: (value: unknown) => boolean;
  minLength?: number;
  maxLength?: number;
  /** Reject keyboard-mash symbols so free text carries actual words. */
  plainText?: boolean;
  /** Extra rule run after the built-in checks; return an error message or null. Gets every value, for rules that depend on another field. */
  validate?: (value: unknown, values: V) => string | null;
}

/** Runs each rule against `values` and returns `{ key: message }` for every failing field - empty when the form is valid. `validate` also runs on an empty optional field, for "fill this when that is set" rules. */
export function validateFields<V extends object>(rules: FieldRule<V>[], values: V): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const rule of rules) {
    const value = (values as Record<string, unknown>)[rule.key];
    if (rule.required && (rule.isEmpty ? rule.isEmpty(value) : isBlank(value))) {
      errors[rule.key] = `${rule.label} is required.`;
      continue;
    }
    const text = typeof value === "string" ? value.trim() : null;
    // Catches the same minimum the backend enforces before it round-trips as a 400.
    if (rule.minLength && text && text.length < rule.minLength) {
      errors[rule.key] = `${rule.label} must be at least ${rule.minLength} characters.`;
      continue;
    }
    // Backstop for pasted text - the input's own maxLength attribute blocks
    // typing past the limit, but doesn't stop a paste that overshoots it.
    if (rule.maxLength && text !== null && text.length > rule.maxLength) {
      errors[rule.key] = `${rule.label} cannot exceed ${rule.maxLength} characters.`;
      continue;
    }
    if (rule.plainText && containsSpecialChars(value)) {
      errors[rule.key] = `${rule.label} can only contain letters, numbers, and basic punctuation (' - & , . ! ?).`;
      continue;
    }
    const customError = rule.validate?.(value, values);
    if (customError) errors[rule.key] = customError;
  }
  return errors;
}

/** Per-field error state for a form: `clearError(key)` drops one message as soon as that field is edited. */
export function useFieldErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  return { errors, setErrors, clearError };
}
