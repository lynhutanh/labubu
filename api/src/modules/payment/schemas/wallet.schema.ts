import { Schema } from "mongoose";
import { WALLET_OWNER_TYPE, WALLET_STATUS } from "../constants";

export const WalletSchema = new Schema(
  {
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
    balance: {
      type: Number,
      required: true,
      default: 0,
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
      enum: Object.values(WALLET_STATUS),
      default: WALLET_STATUS.ACTIVE,
      index: true,
    },
    totalDeposited: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastTransactionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

WalletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });
WalletSchema.index({ status: 1, balance: -1 });
WalletSchema.index({ createdAt: -1 });

WalletSchema.virtual("isActive").get(function () {
  return this.status === WALLET_STATUS.ACTIVE;
});

WalletSchema.virtual("isFrozen").get(function () {
  return this.status === WALLET_STATUS.FROZEN;
});
