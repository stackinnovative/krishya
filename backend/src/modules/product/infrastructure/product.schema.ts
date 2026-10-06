import { Schema, model, Document, Types } from "mongoose";
import type { IColorOption } from "../types/product.type.js";

export interface IProduct extends Document {
  name: string;
  description: string;
  category: Types.ObjectId; // sub-category
  colorOptions: IColorOption[];
  /** Points at the admin-chosen default variant (see colorOptions[].variants[]._id). Null only for legacy/pre-migration documents. */
  defaultVariantId: Types.ObjectId | null;
  /** Price of the variant defaultVariantId points at. Kept in sync by ProductRepository on every write that touches variant prices or the default choice, so list queries never need to recompute it. */
  defaultPrice: number;
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

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category", // sub-category
      required: true,

    },

    /* ---------- Color Options (Embedded, each with its own sizes/stock/price) ---------- */
    colorOptions: {
      type: [
        {
          colorName: {
            type: String,
            trim: true,
          },

          hex: {
            type: String,
            trim: true,
          },

          images: {
            type: [
              {
                url: { type: String, required: true, trim: true },
                publicId: { type: String, required: true },
              },
            ],
            default: [],
          },

          variants: [
            {
              size: {
                type: String,
                uppercase: true,
                trim: true,
              },

              stock: {
                type: Number,
                required: true,
                min: 0,
              },

              price: {
                type: Number,
                required: true,
                min: 0,
              },

              isActive: {
                type: Boolean,
                default: true,
              },
            },
          ],
        },
      ],
      required: true,
      validate: {
        validator: (v: IColorOption[]) => v.length > 0,
        message: "At least one color option is required",
      },
    },

    defaultVariantId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    defaultPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

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
productSchema.index({ "colorOptions.variants.size": 1 });
// Matches the user list query's actual shape (isActive filter + _id sort,
// the default "newest"/"oldest" case) - the previous { isDeleted, isActive }
// index was dead weight: isDeleted isn't a field on this schema at all, so
// it could never serve the isActive-only query it was presumably meant for.
productSchema.index({ isActive: 1, _id: -1 });
productSchema.index({ defaultPrice: 1 });

export const ProductModel = model<IProduct>("Product", productSchema);
