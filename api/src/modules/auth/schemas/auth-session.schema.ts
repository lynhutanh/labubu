import { Schema } from "mongoose";

export const AuthSessionSchema = new Schema(
  {
    source: {
      type: String,
      index: true,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    token: {
      type: String,
      index: true,
    },
    expiryAt: {
      type: Date,
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
    collection: "authsessions",
  },
);
