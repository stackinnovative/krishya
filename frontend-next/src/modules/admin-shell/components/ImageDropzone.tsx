"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Pencil, RefreshCw, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import ImageCropModal from "./ImageCropModal";

/** Already on Cloudinary - what every persisted record stores. */
export interface ImageValue {
  url: string;
  publicId: string;
}

/** Cropped locally but not uploaded yet - the actual upload happens once when
 * the surrounding form is submitted (see FormModal.handleSave), not the
 * moment the user finishes cropping. `originalSrc` is kept around (not
 * revoked) purely so "Edit" can re-open the cropper on the un-cropped
 * source instead of re-cropping an already-cropped, already-compressed
 * preview. */
export interface PendingImage {
  pending: true;
  blob: Blob;
  previewUrl: string;
  originalSrc: string;
}

export type ImageFieldValue = ImageValue | PendingImage;

export const isPendingImage = (v: ImageFieldValue | null | undefined): v is PendingImage =>
  !!v && "pending" in v && v.pending === true;

const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface CropTarget {
  src: string;
  originalSrc: string;
}

/**
 * Reusable image upload field: pick a file -> crop it to a locked aspect
 * ratio (no free-form resize, so the result always matches the slot it's
 * displayed in - hero banner, promo strip, etc.) -> hold the cropped result
 * locally -> Edit/Replace/Remove until the form is actually submitted, at
 * which point FormModal uploads it to Cloudinary. Every admin image field
 * (FormField's "image" type) goes through this so behaviour stays identical
 * everywhere.
 */
export default function ImageDropzone({
  value,
  onChange,
  maxHeight,
  error = false,
  aspectRatio = 1,
}: {
  value: ImageFieldValue | null;
  onChange: (v: ImageFieldValue | null) => void;
  /** Caps how tall the field can render; width always spans the container and height follows aspectRatio. */
  maxHeight?: number;
  error?: boolean;
  /** width / height of the crop frame, e.g. 16/9 for a hero banner, 21/6 for a promo strip. */
  aspectRatio?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);

  // Best-effort cleanup: if the form is closed/cancelled while a crop is
  // pending, its blob: URLs would otherwise leak until the tab is reloaded.
  const valueRef = useRef(value);
  valueRef.current = value;
  useEffect(
    () => () => {
      const v = valueRef.current;
      if (isPendingImage(v)) {
        URL.revokeObjectURL(v.previewUrl);
        URL.revokeObjectURL(v.originalSrc);
      }
    },
    []
  );

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      resetInput();
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Image is too large. Please choose a file under 10 MB.");
      resetInput();
      return;
    }
    const src = URL.createObjectURL(file);
    setCropTarget({ src, originalSrc: src });
  };

  const openEdit = () => {
    if (!value) return;
    const originalSrc = isPendingImage(value) ? value.originalSrc : value.url;
    setCropTarget({ src: originalSrc, originalSrc });
  };

  const closeCropper = () => {
    if (cropTarget) {
      // Don't revoke a blob: URL that the current value still points to
      // (happens when "Edit" is cancelled - it reused the existing pending
      // image's originalSrc rather than creating a fresh one).
      const stillInUse = isPendingImage(value) && value.originalSrc === cropTarget.src;
      if (!stillInUse && cropTarget.src.startsWith("blob:")) URL.revokeObjectURL(cropTarget.src);
    }
    setCropTarget(null);
    resetInput();
  };

  const handleCropConfirm = (blob: Blob) => {
    const target = cropTarget;
    if (!target) return;
    if (isPendingImage(value)) {
      URL.revokeObjectURL(value.previewUrl);
      if (value.originalSrc !== target.originalSrc) URL.revokeObjectURL(value.originalSrc);
    }
    const previewUrl = URL.createObjectURL(blob);
    setCropTarget(null);
    resetInput();
    onChange({ pending: true, blob, previewUrl, originalSrc: target.originalSrc });
  };

  const handleRemove = () => {
    if (isPendingImage(value)) {
      URL.revokeObjectURL(value.previewUrl);
      URL.revokeObjectURL(value.originalSrc);
    }
    onChange(null);
  };

  const fileInput = (
    // No `capture` attribute - that forces mobile straight into the camera
    // with no way to pick an existing photo. Leaving it off lets the
    // browser show its normal chooser (Camera, Gallery/Photos, Files).
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => handleSelect(e.target.files?.[0])}
    />
  );

  const cropModal = cropTarget && (
    <ImageCropModal imageSrc={cropTarget.src} aspectRatio={aspectRatio} onCancel={closeCropper} onConfirm={handleCropConfirm} />
  );

  if (value) {
    const previewSrc = isPendingImage(value) ? value.previewUrl : getOptimizedImageUrl(value.url, 400, Math.round(400 / aspectRatio));
    return (
      <div
        className="relative w-full overflow-hidden rounded-[14px]"
        style={{ aspectRatio, maxHeight }}
        // A plain <img> and this <div> aren't form controls, so a click that
        // lands on them (not on one of the buttons below) is "dead space" to
        // the browser - left alone, the surrounding <label> would silently
        // forward it to whichever labelable element happens to sit first in
        // the DOM (the Edit button, or worse the hidden file input),
        // firing an action the user never asked for. Stopping it here means
        // only an explicit click on Edit/Replace/Remove does anything.
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={previewSrc}
          alt=""
          fill
          sizes="400px"
          className="object-cover"
          unoptimized={isPendingImage(value)}
        />
        <div className="absolute right-2 top-2 flex gap-1.5">
          <button
            type="button"
            onClick={openEdit}
            aria-label="Edit crop"
            title="Edit crop"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90"
          >
            <Pencil size={12} color="#141414" strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Replace image"
            title="Replace image"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90"
          >
            <RefreshCw size={12} color="#141414" strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove image"
            title="Remove image"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90"
          >
            <X size={13} color="#141414" strokeWidth={2.4} />
          </button>
        </div>
        {fileInput}
        {cropModal}
      </div>
    );
  }

  return (
    <div>
      {fileInput}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{ aspectRatio, maxHeight }}
        className={
          error
            ? "flex w-full flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#f0a99b] bg-[#fdf2f0] text-[#d6432f] hover:border-[#d6432f]"
            : "flex w-full flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#d9d9d5] bg-[#fafaf8] text-[#8a8a8e] hover:border-[#141414] hover:text-[#141414]"
        }
      >
        <ImagePlus size={20} />
        <span className="text-[12.5px] font-medium">Tap to upload a photo</span>
      </button>

      {cropModal}
    </div>
  );
}
