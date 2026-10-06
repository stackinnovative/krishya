import { Schema, model, Document, Types } from "mongoose";
import { PAYMENT_MODE, PAYMENT_STATUS, type PaymentMode, type PaymentStatus } from "../types/payment.type.js";




/* ---------- INTERFACE ---------- */

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  guestId: string;
  provider: string;
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus
  paymentMode?: PaymentMode;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ---------- SCHEMA ---------- */

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    guestId: {
      type: String,
      trim: true,
      default: null
    },

    provider: {
      type: String,
      required: true,
      default: "razorpay",
      trim: true,
      index: true,
    },

    providerOrderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    providerPaymentId: {
      type: String,
      trim: true,
    },


    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: PAYMENT_STATUS,

      default: "created",
      index: true,
    },

    paymentMode: {
      type: String,
      enum: PAYMENT_MODE,
    },

    failureReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);



export const PaymentModel = model<IPayment>(
  "Payment",
  paymentSchema,
);
