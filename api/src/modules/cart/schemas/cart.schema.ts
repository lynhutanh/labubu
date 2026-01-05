import { Schema } from "mongoose";
import { CART_OWNER_TYPE } from "../constants";

export const cartSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    ownerType: {
      type: String,
      enum: Object.values(CART_OWNER_TYPE),
      required: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

cartSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });
