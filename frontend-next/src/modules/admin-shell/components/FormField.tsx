"use client";

import { useState, type CSSProperties } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import IconPicker, { type IconOption } from "./IconPicker";
import ImageDropzone, { type ImageFieldValue } from "./ImageDropzone";
import SearchableSelect from "./SearchableSelect";

export type FormFieldType =
  | "text"
  | "number"
  | "email"
  | "tel"
  | "password"
  | "url"
  | "date"
  | "area"
  | "select"
  | "searchable-select"
  | "image"
  | "icon";

/**
 * Single reusable, dynamic input used by every admin form (modal or plain
 * page). Pass `type` to switch the control, `required` to mark it and flag
 * it when empty, and `error` to show a message and switch the field to its
 * error colors — every admin form should render fields through this instead
 * of hand-rolling <input>/<textarea>/<select> markup.
 */
export interface FormFieldProps {
  label: string;
  type?: FormFieldType;
  value: unknown;
  onChange: (value: unknown) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  /** Plain strings render as same-value options; {label,value} pairs let the option's id differ from its display text (e.g. a category picker). */
  options?: string[] | { label: string; value: string }[];
  rows?: number;
  maxLength?: number;
  imageMaxHeight?: number;
  imageAspectRatio?: number;
  /** The allow-list an "icon" field picks from. */
  iconOptions?: IconOption[];
  disabled?: boolean;
  autoComplete?: string;
  /** Short helper text under the control (hidden while an error is shown) - say what the field does or where it appears. */
  hint?: string;
}

/** Letters and combining marks (any language - incl. Devanagari/Tamil/Arabic
 * vowel signs, which are Unicode "marks" rather than "letters") plus
 * numbers, whitespace, and the handful of punctuation marks that show up in
 * real names/headlines - apostrophes, hyphens, ampersands, basic sentence
 * punctuation. Used by callers (FormModal, Settings) to flag keyboard-mash
 * symbols like * ^ $ # @ < > with a validation error - see
 * `containsSpecialChars` below. Not "g" flagged: callers run `.test()` on
 * this repeatedly across fields, and a global regex keeps stale lastIndex
 * state between calls, silently skipping matches. */
const SPECIAL_CHARS_PATTERN = /[^\p{L}\p{M}\p{N}\s.,'!?&()-]/u;

/** True if `value` has a character outside the safe set above - use to flag
 * "text"/"area" fields (names, headlines, descriptions, quotes) as invalid
 * on save. Not meant for url/email/tel, which follow their own formats. */
export const containsSpecialChars = (value: unknown): boolean =>
  typeof value === "string" && SPECIAL_CHARS_PATTERN.test(value);

const baseControlStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  borderRadius: 12,
  fontSize: 13,
  color: "#141414",
  outline: "none",
  fontWeight: 500,
  border: "1px solid #e6e6e3",
  background: "#fafaf8",
  transition: "border-color .15s, background-color .15s",
};

const errorControlStyle: CSSProperties = {
  border: "1px solid #f0a99b",
  background: "#fdf2f0",
};

export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  options,
  rows = 4,
  maxLength,
  imageMaxHeight,
  imageAspectRatio,
  iconOptions,
  disabled,
  autoComplete,
  hint,
}: FormFieldProps) {
  const hasError = !!error;
  const [showPassword, setShowPassword] = useState(false);
  // A <label> forwards clicks on its text to its first button, which would
  // silently pick the first icon - so the icon grid gets a plain wrapper.
  const Wrapper = type === "icon" ? "div" : "label";
  const controlStyle: CSSProperties = hasError ? { ...baseControlStyle, ...errorControlStyle } : baseControlStyle;

  return (
    <Wrapper className="flex flex-col gap-1.5 text-xs font-semibold text-[#555]" data-invalid={hasError || undefined}>
      <span className="flex items-baseline justify-between">
        <span>
          {label}
          {required && (
            <span aria-hidden="true" style={{ color: "#d6432f" }}>
              {" "}
              *
            </span>
          )}
        </span>
        {maxLength && typeof value === "string" && (
          <span className="font-normal text-[#a8a8a4]">
            {value.length}/{maxLength}
          </span>
        )}
      </span>

      {type === "area" ? (
        <textarea
          rows={rows}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={hasError}
          style={{ ...controlStyle, resize: "vertical", lineHeight: 1.5 }}
        />
      ) : type === "select" || type === "searchable-select" ? (
        <SearchableSelect
          value={(value as string) ?? ""}
          onChange={onChange}
          options={(options ?? []).map((o) => (typeof o === "string" ? { label: o, value: o } : o))}
          placeholder={placeholder}
          disabled={disabled}
          error={hasError}
          searchable={type === "searchable-select"}
        />
      ) : type === "image" ? (
        <ImageDropzone
          value={(value as ImageFieldValue | null) ?? null}
          onChange={onChange as (v: ImageFieldValue | null) => void}
          maxHeight={imageMaxHeight}
          aspectRatio={imageAspectRatio}
          error={hasError}
        />
      ) : type === "icon" ? (
        <IconPicker options={iconOptions ?? []} value={(value as string) ?? ""} onChange={onChange} />
      ) : type === "password" ? (
        // The input comes before the toggle, so clicking the label text still focuses the input.
        <span className="relative block">
          <input
            type={showPassword ? "text" : "password"}
            value={(value as string | undefined) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            maxLength={maxLength}
            aria-invalid={hasError}
            style={{ ...controlStyle, paddingRight: 42 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#8a8a8e] hover:text-[#141414] disabled:opacity-50"
          >
            {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
          </button>
        </span>
      ) : (
        <input
          type={type === "number" ? "number" : type}
          value={(value as string | number | undefined) ?? ""}
          onChange={(e) => onChange(type === "number" ? e.target.valueAsNumber || 0 : e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={type === "number" ? undefined : maxLength}
          aria-invalid={hasError}
          style={controlStyle}
        />
      )}

      {hasError ? (
        <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "#d6432f" }}>
          <AlertCircle size={12} strokeWidth={2.4} />
          {error}
        </span>
      ) : (
        hint && <span className="text-[11px] font-normal leading-snug text-[#8a8a8e]">{hint}</span>
      )}
    </Wrapper>
  );
}
