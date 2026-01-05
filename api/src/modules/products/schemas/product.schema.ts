import { Schema } from "mongoose";
import { PRODUCT_STATUS, SKIN_TYPE, PRODUCT_TYPE } from "../constants";

export const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      default: "",
      maxlength: 500,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
      index: true,
    },
    subcategorySlug: {
      type: String,
      default: "",
      index: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "brands",
      default: null,
      index: true,
    },
    productType: {
      type: String,
      enum: Object.values(PRODUCT_TYPE),
      default: PRODUCT_TYPE.OTHER,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      default: "",
      trim: true,
      sparse: true,
      index: true,
    },
    barcode: {
      type: String,
      default: "",
      trim: true,
    },
    fileIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "File",
      },
    ],
    ingredients: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    howToUse: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    volume: {
      type: String,
      default: "",
      maxlength: 50,
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
    },
    skinType: {
      type: [String],
      enum: Object.values(SKIN_TYPE),
      default: [SKIN_TYPE.ALL],
    },
    origin: {
      type: String,
      default: "",
      maxlength: 100,
    },
    madeIn: {
      type: String,
      default: "",
      maxlength: 100,
    },
    expiryMonths: {
      type: Number,
      default: 24,
      min: 1,
    },
    metaTitle: {
      type: String,
      default: "",
      maxlength: 200,
    },
    metaDescription: {
      type: String,
      default: "",
      maxlength: 500,
    },
    metaKeywords: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.PENDING,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
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

productSchema.index({ status: 1, featured: 1 });
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ name: "text", description: "text" });
