import { Schema } from "mongoose";

export const ForgotSchema = new Schema(
  {
    token: {
      type: String,
      index: true,
    },
    source: {
      type: String,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
    },
    authId: {
      type: Schema.Types.ObjectId,
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
    collection: "forgots",
  },
);
