import { Schema } from "mongoose";

export const FileSchema = new Schema(
  {
    type: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    mimeType: {
      type: String,
      default: "",
    },
    server: {
      type: String,
      default: "diskStorage",
    },
    path: {
      type: String,
      default: "",
    },
    absolutePath: {
      type: String,
      default: "",
    },
    width: {
      type: Number,
      default: 500,
    },
    height: {
      type: Number,
      default: 500,
    },
    size: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    thumbnailPath: {
      type: String,
      default: "",
    },
    thumbnailAbsolutePath: {
      type: String,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);
