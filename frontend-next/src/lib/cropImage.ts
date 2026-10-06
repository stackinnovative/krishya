export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.crossOrigin = "anonymous";
    img.src = src;
  });

/** Renders the selected crop region onto a canvas at its native pixel size and
 * resolves a JPEG Blob - used to turn a react-easy-crop selection into an
 * uploadable file without ever sending the full, uncropped original. */
export async function getCroppedImageBlob(imageSrc: string, crop: PixelCrop, mimeType = "image/jpeg", quality = 0.92): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to crop image."))),
      mimeType,
      quality
    );
  });
}
