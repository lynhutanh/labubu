import { Schema } from "mongoose";

export const AddressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    ward: {
      type: String,
      default: "",
    },
    wardCode: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      default: "",
    },
    districtId: {
      type: Number,
      default: null,
    },
    city: {
      type: String,
      required: true,
    },
    provinceId: {
      type: Number,
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

AddressSchema.index({ userId: 1, isDefault: 1 });
