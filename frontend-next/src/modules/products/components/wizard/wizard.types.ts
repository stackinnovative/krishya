import type { AdminProductImage } from "../../types/product.type";
import type { ImageFieldValue } from "@/modules/admin-shell/components/ImageDropzone";

export type WizardSize = {
  id?: string; // present once persisted as a real variant
  size: string;
  price: string;
  stock: string;
  isDefault?: boolean;
};

export type WizardColor = {
  id?: string; // present once persisted as a real colour option
  name: string;
  hex: string;
  images: ImageFieldValue[];
  sizes: WizardSize[];
};

/** A WizardColor whose images have all been resolved to real uploads - the shape the save API actually accepts. */
export type ResolvedWizardColor = Omit<WizardColor, "images"> & { images: AdminProductImage[] };

export type WizardDetails = {
  name: string;
  description: string;
  categoryId: string;
  isFeatured: boolean;
};

export const SWATCHES: [string, string][] = [
  ["Gold", "#d4af37"],
  ["Rose Gold", "#b76e79"],
  ["Silver", "#c0c0c0"],
  ["Antique", "#8b6b3d"],
  ["Ruby", "#b8412f"],
  ["Emerald", "#2e8b57"],
  ["Teal", "#1f7a86"],
  ["Black", "#222222"],
];

export const newColor = (i = 0): WizardColor => {
  const [name, hex] = SWATCHES[i % SWATCHES.length]!;
  return { name, hex, images: [], sizes: [{ size: "", price: "", stock: "" }] };
};
