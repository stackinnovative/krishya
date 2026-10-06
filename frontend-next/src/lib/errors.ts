import { isAxiosError } from "axios";

interface ValidationErrorBody {
  message?: string;
  errors?: Record<string, string>;
}

/** Pulls the first field error (or top-level message) out of the backend's
 * { message, errors: { field: msg } } validation response, falling back to
 * a generic message for anything else (network failure, 500, etc.). */
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError<ValidationErrorBody>(err)) {
    const data = err.response?.data;
    const firstFieldError = data?.errors && Object.values(data.errors)[0];
    return firstFieldError || data?.message || fallback;
  }
  return fallback;
};
