import { Schema } from "mongoose";

export const AuthSchema = new Schema(
  {
    source: {
      type: String,
      default: "user",
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    type: {
      type: String,
      default: "password",
      index: true,
    },
    key: {
      type: String,
      index: true,
    },
    value: {
      type: String,
    },
    salt: {
      type: String,
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
    collection: "auths",
  },
);
