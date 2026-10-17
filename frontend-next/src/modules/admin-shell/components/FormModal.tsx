"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { whitePillButton } from "../style-helpers";
import AdminButton from "./AdminButton";
import FormField from "./FormField";
import type { IconOption } from "./IconPicker";
import { isPendingImage, type ImageFieldValue } from "./ImageDropzone";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ModalPortal } from "@/shared/ui/modal/ModalPortal";
import { useModalShell } from "@/shared/ui/modal/useModalShell";
import { scrollToFirstError } from "@/shared/scrollToFirstError";
import { useFieldErrors, validateFields } from "@/shared/form-validation";
import { getApiFieldErrors } from "@/lib/errors";

export type FormFieldDef = (
  | { type: "text" | "number" | "email" | "tel" | "url" | "password"; placeholder?: string; minLength?: number; maxLength?: number }
  | { type: "area"; placeholder?: string; rows?: number; minLength?: number; maxLength?: number }
  | { type: "select" | "searchable-select"; options: string[] | { label: string; value: string }[]; placeholder?: string }
  | { type: "image"; imageMaxHeight?: number; imageAspectRatio?: number }
  | { type: "icon"; iconOptions: IconOption[] }
) & {
  key: string;
  label: string;
  required?: boolean;
  allowSpecialChars?: boolean;
  /** Helper text under the field - what it does / where it shows. */
  hint?: string;
  /** Extra rule run after the built-in checks; return an error message or null. Gets every value, for rules that depend on another field. */
  validate?: (value: unknown, values: Record<string, unknown>) => string | null;
};

export default function FormModal({
  title,
  fields,
  initialValues,
  saveLabel = "Save",
  onSave,
  onClose,
}: {
  title: string;
  fields: FormFieldDef[];
  initialValues: Record<string, unknown>;
  saveLabel?: string;
  onSave: (values: Record<string, unknown>) => Promise<void> | void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const { errors, setErrors, clearError } = useFieldErrors();
  const [saving, setSaving] = useState(false);

  const set = (key: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    clearError(key);
  };

  const validate = () =>
    validateFields(
      fields.map((f) => ({
        key: f.key,
        label: f.label,
        required: f.required,
        isEmpty: f.type === "image" ? (v: unknown) => !v : undefined,
        minLength: "minLength" in f ? f.minLength : undefined,
        maxLength: "maxLength" in f ? f.maxLength : undefined,
        // Free-form "text" and "area" fields (names, headlines, descriptions,
        // quotes) reject keyboard-mash symbols so every value carries actual
        // words; url/email/tel/number keep their own format rules instead.
        plainText: (f.type === "text" || f.type === "area") && !f.allowSpecialChars,
        validate: f.validate,
      })),
      values,
    );

  // Images are cropped locally and held as a pending blob (see ImageDropzone)
  // so nothing hits Cloudinary until the form is actually submitted - this
  // resolves each one to its real { url, publicId } right before onSave.
  const resolvePendingImages = async (): Promise<Record<string, unknown>> => {
    const resolved = { ...values };
    for (const f of fields) {
      if (f.type !== "image") continue;
      const v = resolved[f.key] as ImageFieldValue | null | undefined;
      if (!isPendingImage(v)) continue;
      const file = new File([v.blob], "upload.jpg", { type: v.blob.type || "image/jpeg" });
      resolved[f.key] = await uploadToCloudinary(file);
    }
    return resolved;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      scrollToFirstError();
      return;
    }
    setSaving(true);
    try {
      let resolved: Record<string, unknown>;
      try {
        resolved = await resolvePendingImages();
      } catch (err) {
        if (err instanceof Error && err.message.includes("Cloudinary configuration")) {
          toast.error(err.message);
        } else {
          toast.error("Image upload failed. Please try again.");
        }
        return;
      }
      await onSave(resolved);
    } catch (err) {
      // The backend's own validation ({ errors: { field: msg } }) goes under
      // the matching input, same as client-side errors; the modal stays open
      // so nothing typed is lost. "image.url" -> the "image" field, etc.
      const apiErrors = getApiFieldErrors(err);
      if (apiErrors) {
        const fieldKeys = new Set(fields.map((f) => f.key));
        const inline: Record<string, string> = {};
        const unmatched: string[] = [];
        for (const [path, message] of Object.entries(apiErrors)) {
          const key = path.split(".")[0] ?? path;
          if (fieldKeys.has(key)) inline[key] ??= message;
          else unmatched.push(message);
        }
        if (Object.keys(inline).length > 0) {
          setErrors((prev) => ({ ...prev, ...inline }));
          scrollToFirstError();
        }
        if (unmatched[0]) toast.error(unmatched[0]);
      }
      // Anything else (network, 500) was already reported by the save hook's onError toast.
    } finally {
      setSaving(false);
    }
  };

  const { onBackdropClick, onPanelClick } = useModalShell({ onRequestClose: onClose, busy: saving });

  return (
    <ModalPortal>
      <div
        onClick={onBackdropClick}
        className="fixed inset-0 z-[200] flex items-center justify-center p-3"
        style={{ background: "rgba(20,20,20,.45)", backdropFilter: "blur(2px)" }}
      >
        <div
          onClick={onPanelClick}
          className="animate-fade-up box-border flex w-full flex-col"
          style={{ background: "#fff", borderRadius: 22, maxWidth: 520, maxHeight: "90vh" }}
        >
          {/* Header stays put - only the fields area below scrolls, so the
              title/close button are never pushed off-screen. */}
          <div
            className="flex flex-none items-center justify-between px-6 pb-4 pt-6"
            style={{ borderBottom: "1px solid #f3f3f1" }}
          >
            <div className="text-[18px] font-bold tracking-[-.01em]">{title}</div>
            <button
              onClick={onClose}
              disabled={saving}
              className="flex h-8 w-8 items-center justify-center rounded-full border-none"
              style={{ background: "#f3f3f1", opacity: saving ? 0.5 : 1, cursor: saving ? "not-allowed" : "pointer" }}
            >
              <X size={14} color="#141414" strokeWidth={2.2} />
            </button>
          </div>

          <div className="admin-modal-scroll min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-3">
              {fields.map((f) => (
                <FormField
                  key={f.key}
                  label={f.label}
                  type={f.type}
                  required={f.required}
                  error={errors[f.key]}
                  value={values[f.key]}
                  onChange={(v) => set(f.key, v)}
                  placeholder={"placeholder" in f ? f.placeholder : undefined}
                  options={"options" in f ? f.options : undefined}
                  rows={"rows" in f ? f.rows : undefined}
                  maxLength={"maxLength" in f ? f.maxLength : undefined}
                  imageMaxHeight={"imageMaxHeight" in f ? f.imageMaxHeight : undefined}
                  imageAspectRatio={"imageAspectRatio" in f ? f.imageAspectRatio : undefined}
                  iconOptions={"iconOptions" in f ? f.iconOptions : undefined}
                  hint={f.hint}
                />
              ))}
            </div>
          </div>

          {/* Footer stays put too - Save/Cancel are always reachable without
              scrolling, no matter how many fields the form has. */}
          <div
            className="flex flex-none justify-end gap-2 px-6 pb-6 pt-4"
            style={{ borderTop: "1px solid #f3f3f1" }}
          >
            <button
              style={{ ...whitePillButton, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <AdminButton loading={saving} loadingText="Saving…" onClick={handleSave}>
              {saveLabel}
            </AdminButton>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
