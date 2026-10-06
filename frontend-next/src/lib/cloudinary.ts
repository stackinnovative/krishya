import axios from "axios";
import { env } from "./env";

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export const uploadToCloudinary = async (file: File) => {
  if (!env.cloudinaryCloudName || !env.cloudinaryUploadPreset) {
    throw new Error(
      "Cloudinary configuration is missing (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", env.cloudinaryUploadPreset);

  const response = await axios.post<CloudinaryResponse>(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    formData
  );

  return { url: response.data.secure_url, publicId: response.data.public_id };
};

/** Injects Cloudinary delivery transformations so images are served at display size, not full resolution. */
export const getOptimizedImageUrl = (url: string | undefined, width: number, height: number = width): string => {
  if (!url) return "";
  if (!url.includes("/upload/")) return url;
  const transformations = `f_auto,q_auto,c_fill,w_${width},h_${height},dpr_auto`;
  return url.replace("/upload/", `/upload/${transformations}/`);
};

/** Forces the browser to download (rather than navigate to) a Cloudinary-hosted image, at its original resolution. */
export const getDownloadUrl = (url: string | undefined): string => {
  if (!url) return "";
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
};
