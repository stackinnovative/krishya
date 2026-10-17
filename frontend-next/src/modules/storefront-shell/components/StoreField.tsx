import type { ReactNode } from "react";
import { AlertCircleIcon } from "./icons";

/** Storefront text input / select look. Inside a `StoreField` with an error it switches to the error colours on its own (via the field's `data-invalid`), so callers never toggle classes by hand. */
export const storeInputClass =
  "h-12 w-full rounded-lg border border-ka-line bg-ka-cream px-3.5 text-[15px] font-normal text-ka-ink outline-none focus:border-ka-sage focus:ring-2 focus:ring-ka-sage/40 group-data-[invalid=true]:border-ka-error group-data-[invalid=true]:bg-ka-error/5 group-data-[invalid=true]:focus:ring-ka-error/25";

/** Red icon + message under a storefront control. Renders nothing without a message. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ka-error">
      <AlertCircleIcon size={14} strokeWidth={2} className="flex-none" />
      {message}
    </span>
  );
}

/**
 * Storefront form row: label, the control passed as children (styled with
 * `storeInputClass`) and its validation message. Sets `data-invalid` so
 * `scrollToFirstError` can find it - the storefront twin of the admin
 * FormField, with errors coming from `validateFields` in shared/form-validation.
 */
export default function StoreField({
  label,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  /** Shows the red asterisk after the label, same as the admin FormField. The rule itself lives in the form's validation rules. */
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`group flex flex-col gap-1.5 text-[13px] font-semibold text-ka-green ${className}`} data-invalid={!!error || undefined}>
      <span>
        {label}
        {required && (
          <span aria-hidden="true" className="text-ka-error">
            {" "}
            *
          </span>
        )}
      </span>
      {children}
      <FieldError message={error} />
    </label>
  );
}
