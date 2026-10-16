import { Schema, model, Document } from "mongoose";
import type { CategoryIconName } from "../types/category.type.js";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon: CategoryIconName;
  sortOrder: number;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },

    // Built from the name once, at creation, and never changed - so shared
    // and indexed /shop/<slug> links keep working after a rename.
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    icon: {
      type: String,
      required: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

categorySchema.index({ isActive: 1, sortOrder: 1, name: 1 });

export const CategoryModel = model<ICategory>("Category", categorySchema);
