"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ZoomIn, ZoomOut } from "lucide-react";
import { blackPillButton, whitePillButton } from "../style-helpers";
import { getCroppedImageBlob, type PixelCrop } from "@/lib/cropImage";
import { ModalPortal } from "@/shared/ui/modal/ModalPortal";
import { useModalShell } from "@/shared/ui/modal/useModalShell";

/**
 * Fixed-aspect crop step shown between "user picked a file" and "upload it".
 * The aspect ratio is locked by the caller (hero = 16/9, banner = 21/6, …) -
 * the user can only pan/zoom within that frame, never resize it, so every
 * image saved through this modal already matches the slot it will render in.
 */
export default function ImageCropModal({
  imageSrc,
  aspectRatio,
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  aspectRatio: number;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels as PixelCrop);
      onConfirm(blob);
    } catch {
      setProcessing(false);
    }
  };

  const { onBackdropClick, onPanelClick } = useModalShell({ onRequestClose: onCancel, busy: processing });

  return (
    <ModalPortal>
      <div
        onClick={onBackdropClick}
        className="fixed inset-0 z-[200] flex items-center justify-center p-3"
        style={{ background: "rgba(20,20,20,.6)", backdropFilter: "blur(2px)" }}
      >
      <div
        onClick={onPanelClick}
        className="animate-fade-up box-border flex w-full flex-col"
        style={{ background: "#fff", borderRadius: 22, maxWidth: 560, maxHeight: "90vh" }}
      >
        <div className="flex flex-none items-center justify-between px-6 pb-4 pt-6" style={{ borderBottom: "1px solid #f3f3f1" }}>
          <div className="text-[18px] font-bold tracking-[-.01em]">Crop image</div>
          <div className="text-[11.5px] font-semibold text-[#8a8a8e]">Drag to reposition &middot; pinch or scroll to zoom</div>
        </div>

        <div className="relative w-full flex-none bg-[#141414]" style={{ height: 380 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition
            objectFit="contain"
          />
        </div>

        <div className="flex flex-none items-center gap-3 px-6 pt-4">
          <ZoomOut size={16} className="flex-none text-[#8a8a8e]" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[#141414]"
            aria-label="Zoom"
          />
          <ZoomIn size={16} className="flex-none text-[#8a8a8e]" />
        </div>

        <div className="flex flex-none justify-end gap-2 px-6 pb-6 pt-4" style={{ borderTop: "1px solid #f3f3f1" }}>
          <button style={whitePillButton} onClick={onCancel} disabled={processing}>
            Cancel
          </button>
          <button
            style={{ ...blackPillButton, padding: "11px 22px", opacity: processing ? 0.6 : 1 }}
            onClick={handleConfirm}
            disabled={processing || !croppedAreaPixels}
          >
            {processing ? "Processing…" : "Use photo"}
          </button>
        </div>
      </div>
      </div>
    </ModalPortal>
  );
}
