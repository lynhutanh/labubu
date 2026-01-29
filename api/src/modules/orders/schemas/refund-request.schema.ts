import { Schema } from "mongoose";
import { REFUND_REQUEST_STATUS } from "../constants";

export const refundRequestSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "order",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(REFUND_REQUEST_STATUS),
      default: REFUND_REQUEST_STATUS.PENDING,
      index: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

refundRequestSchema.index({ orderId: 1, status: 1 });
refundRequestSchema.index({ userId: 1, status: 1 });
refundRequestSchema.index({ status: 1, createdAt: -1 });
refundRequestSchema.index({ createdAt: -1 });

export const RefundRequestSchema = refundRequestSchema;
