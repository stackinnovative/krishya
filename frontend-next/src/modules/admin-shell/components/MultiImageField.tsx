"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Pencil, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import ImageCropModal from "./ImageCropModal";
import { isPendingImage, type ImageFieldValue } from "./ImageDropzone";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface CropTarget {
  /** index into `value` being replaced, or null when adding a new image */
  index: number | null;
  src: string;
  originalSrc: string;
}

/**
 * Reusable multi-image field: the same "pick -> crop to a locked aspect
 * ratio -> hold locally as a pending blob" contract as ImageDropzone, but
 * for a capped array instead of a single image - used wherever a record can
 * carry a handful of photos (e.g. one per product colour). Nothing uploads
 * until the surrounding form resolves the pending images at submit time.
 */
export default function MultiImageField({
  value,
  onChange,
  max = 3,
  aspectRatio = 1,
  error = false,
}: {
  value: ImageFieldValue[];
  onChange: (v: ImageFieldValue[]) => void;
  /** Max number of images allowed - the trailing "add" tile hides once reached. */
  max?: number;
  /** width / height of the crop frame. */
  aspectRatio?: number;
  error?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);

  // Best-effort cleanup: revoke any still-pending blob: URLs left over if the
  // form closes/cancels mid-edit, mirroring ImageDropzone's own effect.
  const valueRef = useRef(value);
  valueRef.current = value;
  useEffect(
    () => () => {
      for (const v of valueRef.current) {
        if (isPendingImage(v)) {
          URL.revokeObjectURL(v.previewUrl);
          URL.revokeObjectURL(v.originalSrc);
        }
      }
    },
    [],
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
    setCropTarget({ index: null, src, originalSrc: src });
  };

  const openEdit = (index: number) => {
    const current = value[index];
    if (!current) return;
    const originalSrc = isPendingImage(current) ? current.originalSrc : current.url;
    setCropTarget({ index, src: originalSrc, originalSrc });
  };

  const closeCropper = () => {
    if (cropTarget) {
      const current = cropTarget.index !== null ? value[cropTarget.index] : undefined;
      const stillInUse = isPendingImage(current) && current.originalSrc === cropTarget.src;
      if (!stillInUse && cropTarget.src.startsWith("blob:")) URL.revokeObjectURL(cropTarget.src);
    }
    setCropTarget(null);
    resetInput();
  };

  const handleCropConfirm = (blob: Blob) => {
    const target = cropTarget;
    if (!target) return;
    const previewUrl = URL.createObjectURL(blob);
    const next: ImageFieldValue = { pending: true, blob, previewUrl, originalSrc: target.originalSrc };

    if (target.index === null) {
      onChange([...value, next]);
    } else {
      const replaced = value[target.index];
      if (isPendingImage(replaced)) {
        URL.revokeObjectURL(replaced.previewUrl);
        if (replaced.originalSrc !== target.originalSrc) URL.revokeObjectURL(replaced.originalSrc);
      }
      onChange(value.map((v, i) => (i === target.index ? next : v)));
    }
    setCropTarget(null);
    resetInput();
  };

  const handleRemove = (index: number) => {
    const removed = value[index];
    if (isPendingImage(removed)) {
      URL.revokeObjectURL(removed.previewUrl);
      URL.revokeObjectURL(removed.originalSrc);
    }
    onChange(value.filter((_, i) => i !== index));
  };

  const tileClass = error
    ? "flex h-[84px] w-[84px] flex-none flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-[#f0a99b] bg-[#fdf2f0] text-center text-[10.5px] font-semibold text-[#d6432f]"
    : "flex h-[84px] w-[84px] flex-none flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-[#d9d9d5] bg-[#fafaf8] text-center text-[10.5px] font-semibold text-[#8a8a8e] hover:border-[#141414] hover:text-[#141414]";

  return (
    <div className="flex flex-wrap gap-2">
      {value.map((img, i) => {
        const previewSrc = isPendingImage(img) ? img.previewUrl : getOptimizedImageUrl(img.url, 168);
        return (
          <div key={i} className="relative h-[84px] w-[84px] flex-none overflow-hidden rounded-xl">
            <Image src={previewSrc} alt="" fill sizes="84px" className="object-cover" unoptimized={isPendingImage(img)} />
            {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold">Primary</span>}
            <div className="absolute right-1.5 top-1.5 flex gap-1">
              <button
                type="button"
                onClick={() => openEdit(i)}
                aria-label="Edit crop"
                title="Edit crop"
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/90"
              >
                <Pencil size={10} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                aria-label="Remove image"
                title="Remove image"
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/90"
              >
                <X size={10} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        );
      })}

      {value.length < max && (
        <button type="button" onClick={() => inputRef.current?.click()} className={tileClass}>
          <ImagePlus size={16} />
          Add photo
        </button>
      )}

      {/* No `capture` attribute - that forces mobile straight into the camera with no way to pick an existing photo. */}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleSelect(e.target.files?.[0])} />

      {cropTarget && (
        <ImageCropModal imageSrc={cropTarget.src} aspectRatio={aspectRatio} onCancel={closeCropper} onConfirm={handleCropConfirm} />
      )}
    </div>
  );
}
