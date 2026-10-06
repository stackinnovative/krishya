import { Schema, model, Document } from "mongoose";
export type UserRole = "admin" | "user";

export interface IUserAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  tokenVersion: number;
  isBlocked: boolean;
  isGuest: boolean;
  isVerified?: boolean;
  googleId?: string;
  address?: IUserAddress;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      minlength: 6,
    },

    phone: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },

    isGuest: {
      type: Boolean,
      default: true,
    },

    address: {
      addressLine1: { type: String, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    googleId: {
      type: String,
      index: true,
      sparse: true,
    },

    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


userSchema.index({ email: 1, role: 1 });

export const UserModel = model<IUser>("User", userSchema);
