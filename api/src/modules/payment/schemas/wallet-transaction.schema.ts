import { Schema } from "mongoose";
import {
  WALLET_TRANSACTION_TYPE,
  WALLET_TRANSACTION_STATUS,
  WALLET_OWNER_TYPE,
} from "../constants";

export const WalletTransactionSchema = new Schema(
  {
    transactionCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "wallet",
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    ownerType: {
      type: String,
      required: true,
      enum: Object.values(WALLET_OWNER_TYPE),
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(WALLET_TRANSACTION_TYPE),
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "VND",
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(WALLET_TRANSACTION_STATUS),
      default: WALLET_TRANSACTION_STATUS.PENDING,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    referenceId: {
      type: String,
      sparse: true,
      index: true,
    },
    referenceType: {
      type: String,
      enum: ["order", "deposit", "withdraw", "refund", "transfer"],
      sparse: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    failedReason: {
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

WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });
WalletTransactionSchema.index({ ownerId: 1, ownerType: 1, createdAt: -1 });
WalletTransactionSchema.index({ type: 1, status: 1 });
WalletTransactionSchema.index({ referenceId: 1, referenceType: 1 });
WalletTransactionSchema.index({ createdAt: -1 });

WalletTransactionSchema.virtual("isCompleted").get(function () {
  return this.status === WALLET_TRANSACTION_STATUS.COMPLETED;
});

WalletTransactionSchema.virtual("isPending").get(function () {
  return this.status === WALLET_TRANSACTION_STATUS.PENDING;
});

WalletTransactionSchema.virtual("isFailed").get(function () {
  return this.status === WALLET_TRANSACTION_STATUS.FAILED;
});

WalletTransactionSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date();
    if (
      this.status === WALLET_TRANSACTION_STATUS.COMPLETED &&
      !this.completedAt
    ) {
      this.completedAt = now;
    }
    if (this.status === WALLET_TRANSACTION_STATUS.FAILED && !this.failedAt) {
      this.failedAt = now;
    }
  }
  next();
});
