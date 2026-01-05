import { Schema } from "mongoose";

export const SettingSchema = new Schema(
  {
    key: {
      type: String,
      unique: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      default: "text",
    },
    meta: {
      type: Schema.Types.Mixed,
    },
    public: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
    group: {
      type: String,
      default: "general",
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
    collection: "settings",
  },
);
