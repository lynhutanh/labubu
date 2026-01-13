import { Schema } from "mongoose";
import { WISHLIST_OWNER_TYPE } from "../constants";

export const wishlistSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    ownerType: {
      type: String,
      enum: Object.values(WISHLIST_OWNER_TYPE),
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

wishlistSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });
wishlistSchema.index({ "items.productId": 1 });
