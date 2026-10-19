import { isAxiosError } from "axios";

interface ValidationErrorBody {
  message?: string;
  errors?: Record<string, string>;
}

/** Pulls the first field error (or top-level message) out of the backend's
 * { message, errors: { field: msg } } validation response, falling back to
 * a generic message for anything else (network failure, 500, etc.). */
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError<ValidationErrorBody | string>(err)) {
    const data = err.response?.data;
    // Rate limiters (express-rate-limit) reply with a plain-text body, not JSON.
    if (typeof data === "string") return data || fallback;
    const firstFieldError = data?.errors && Object.values(data.errors)[0];
    return firstFieldError || data?.message || fallback;
  }
  return fallback;
};


/** HTTP status of a failed API call (e.g. 409 for a duplicate), or null for a network failure. */
export const getApiStatus = (err: unknown): number | null => (isAxiosError(err) ? (err.response?.status ?? null) : null);

/** The backend's per-field validation messages ({ errors: { field: msg } }),
 * or null when the failure isn't a field-level one (network, 500, a plain
 * message). Nested paths like "image.url" are kept as-is. */
export const getApiFieldErrors = (err: unknown): Record<string, string> | null => {
  if (!isAxiosError<ValidationErrorBody>(err)) return null;
  const errors = err.response?.data?.errors;
  return errors && typeof errors === "object" && Object.keys(errors).length > 0 ? errors : null;
};
