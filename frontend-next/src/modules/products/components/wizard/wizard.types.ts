import type { ImageFieldValue } from "@/modules/admin-shell/components/ImageDropzone";
import type { ProductType, VariantUnit } from "../../constants/product-options";

/** One quantity row as typed - numbers stay strings until save so an empty input isn't silently 0. */
export type WizardVariant = {
  id?: string; // present once persisted as a real variant
  quantity: string;
  unit: VariantUnit;
  mrp: string;
  price: string;
  stock: string;
  isActive: boolean;
  isDefault: boolean;
};

export type WizardIngredient = { name: string; botanicalName: string };

export type WizardDetails = {
  name: string;
  categoryId: string;
  type: ProductType | "";
  shortDescription: string;
  description: string;
  badge: string;
  isFeatured: boolean;
};

export type WizardTabs = {
  ingredients: WizardIngredient[];
  howToUse: string;
  storage: string;
};

export type WizardImages = ImageFieldValue[];

export const newVariant = (prev?: WizardVariant): WizardVariant => ({
  quantity: "",
  unit: prev?.unit ?? "ml",
  mrp: "",
  price: "",
  stock: "",
  isActive: true,
  isDefault: false,
});

export const newIngredient = (): WizardIngredient => ({ name: "", botanicalName: "" });
