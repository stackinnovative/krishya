import { Schema, model, Document, Types } from "mongoose";
import {
  PRODUCT_TYPES,
  VARIANT_UNITS,
  type IImage,
  type IIngredient,
  type IVariant,
  type ProductType,
} from "../types/product.type.js";

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: Types.ObjectId;
  type: ProductType;
  shortDescription: string;
  description: string;
  ingredients: IIngredient[];
  howToUse?: string;
  storage?: string;
  badge?: string;
  images: IImage[];
  variants: IVariant[];
  /** Points at the admin-chosen default variant (see variants[]._id). */
  defaultVariantId: Types.ObjectId | null;
  /** Copied from the default variant by ProductRepository on every write that touches variants or the default choice, so list queries and price sorting never recompute them. */
  defaultPrice: number;
  defaultMrp: number;
  defaultDiscountPercent: number;
  isActive: boolean;
  isFeatured: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Built from the name once, at creation, and never changed - so shared
    // and indexed /products/<slug> links keep working after a rename.
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    type: {
      type: String,
      enum: PRODUCT_TYPES,
      required: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    ingredients: {
      type: [
        {
          _id: false,
          name: { type: String, required: true, trim: true },
          botanicalName: { type: String, trim: true },
        },
      ],
      default: [],
    },

    howToUse: { type: String, trim: true },
    storage: { type: String, trim: true },
    badge: { type: String, trim: true },

    images: {
      type: [
        {
          _id: false,
          url: { type: String, required: true, trim: true },
          publicId: { type: String, required: true },
        },
      ],
      validate: {
        validator: (v: IImage[]) => v.length > 0,
        message: "At least one product photo is required",
      },
    },

    /* ---------- Quantity variants (200 ml, 100 g, 60 tablets) ---------- */
    variants: {
      type: [
        {
          quantity: { type: Number, required: true, min: 0 },
          unit: { type: String, enum: VARIANT_UNITS, required: true },
          mrp: { type: Number, required: true, min: 0 },
          price: { type: Number, required: true, min: 0 },
          discountPercent: { type: Number, required: true, min: 0, max: 100, default: 0 },
          stock: { type: Number, required: true, min: 0 },
          isActive: { type: Boolean, default: true },
        },
      ],
      validate: {
        validator: (v: IVariant[]) => v.length > 0,
        message: "At least one variant is required",
      },
    },

    defaultVariantId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    defaultPrice: { type: Number, required: true, min: 0, default: 0 },
    defaultMrp: { type: Number, required: true, min: 0, default: 0 },
    defaultDiscountPercent: { type: Number, required: true, min: 0, max: 100, default: 0 },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/* ---------- Indexes ---------- */
productSchema.index({ category: 1 });
productSchema.index({ type: 1 });
// Matches the user list query's actual shape (isActive filter + _id sort,
// the default "newest"/"oldest" case).
productSchema.index({ isActive: 1, _id: -1 });
productSchema.index({ defaultPrice: 1 });

export const ProductModel = model<IProduct>("Product", productSchema);
