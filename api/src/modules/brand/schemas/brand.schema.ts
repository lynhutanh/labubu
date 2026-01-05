import { Schema } from "mongoose";
import { BRAND_STATUS } from "../constants";

export const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: "File",
      default: null,
    },
    website: {
      type: String,
      default: "",
      maxlength: 255,
    },
    origin: {
      type: String,
      default: "",
      maxlength: 100,
    },
    status: {
      type: String,
      enum: Object.values(BRAND_STATUS),
      default: BRAND_STATUS.ACTIVE,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "brands",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
brandSchema.index({ name: 1 });
brandSchema.index({ status: 1, sortOrder: 1 });
brandSchema.index({ createdAt: -1 });

export const BrandSchema = brandSchema;
