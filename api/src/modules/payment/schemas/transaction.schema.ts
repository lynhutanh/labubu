import { Schema } from "mongoose";
import {
  TRANSACTION_STATUS,
  PAYMENT_METHOD,
  PAYMENT_PROVIDER,
} from "../constants";

export const TransactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      index: true,
    },
    externalTransactionId: {
      type: String,
      sparse: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "VND",
      enum: ["VND", "USD"],
    },
    description: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_METHOD),
      index: true,
    },
    paymentProvider: {
      type: String,
      enum: Object.values(PAYMENT_PROVIDER),
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
      index: true,
    },
    providerData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    notes: {
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

TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ orderId: 1, status: 1 });
TransactionSchema.index({ orderNumber: 1, status: 1 });
TransactionSchema.index({ paymentMethod: 1, status: 1 });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ createdAt: -1 });

TransactionSchema.virtual("isSuccessful").get(function () {
  return this.status === TRANSACTION_STATUS.COMPLETED;
});

TransactionSchema.virtual("isPending").get(function () {
  return (
    this.status === TRANSACTION_STATUS.PENDING ||
    this.status === TRANSACTION_STATUS.PROCESSING
  );
});

TransactionSchema.virtual("isFailed").get(function () {
  return (
    this.status === TRANSACTION_STATUS.FAILED ||
    this.status === TRANSACTION_STATUS.CANCELLED
  );
});

TransactionSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date();
    if (this.status === TRANSACTION_STATUS.COMPLETED && !this.completedAt) {
      this.completedAt = now;
    }
    if (
      (this.status === TRANSACTION_STATUS.FAILED ||
        this.status === TRANSACTION_STATUS.CANCELLED) &&
      !this.failedAt
    ) {
      this.failedAt = now;
    }
  }
  next();
});
