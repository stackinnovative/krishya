export const assertUniqueVariantSizes = (variants: { size?: string | undefined }[]): boolean => {
  const normalizedSizes = variants
    .map((v) => v.size?.trim().toLowerCase())
    .filter((s): s is string => !!s);
  const uniqueSizeCount = new Set(normalizedSizes).size;
  return uniqueSizeCount === normalizedSizes.length;
};
