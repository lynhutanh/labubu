import { Schema } from "mongoose";

export const VerificationSchema = new Schema(
  {
    token: {
      type: String,
      index: true,
    },
    value: {
      type: String,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
    },
    sourceType: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "verifications",
  },
);
