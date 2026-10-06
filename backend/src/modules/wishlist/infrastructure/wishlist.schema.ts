import { Schema, model, Document, Types } from "mongoose";

export interface IWishlist extends Document {
  userId: Types.ObjectId | null;
  guestId: string | null;
  productIds: Types.ObjectId[];
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    guestId: {
      type: String,
      default: null,
      index: true,
    },

    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const WishlistModel = model<IWishlist>("Wishlist", wishlistSchema);
