import z from "zod";

export const ImageSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Image URL must be a valid URL"),

  publicId: z
    .string()
    .trim()
    .min(1, "Image publicId is required"),
});