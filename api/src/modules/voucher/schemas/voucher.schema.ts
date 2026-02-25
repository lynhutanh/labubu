import { Schema } from 'mongoose';

export const voucherSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percentage', 'fixed', 'shipping'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, required: true, default: 0 },
    maxDiscountAmount: { type: Number, required: true, default: 0 },
    totalQuantity: { type: Number, required: true, min: 1 },
    usedQuantity: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    applicableCategories: { type: [String], default: [] },
    applicableProducts: { type: [String], default: [] },
    applicableUsers: { type: [String], default: [] },
    maxUsesPerUser: { type: Number, default: 1 },
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active', index: true },
    image: { type: String, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

voucherSchema.index({ status: 1, startDate: 1, endDate: 1 });
voucherSchema.index({ code: 1 });
voucherSchema.index({ createdAt: -1 });

export const VoucherSchema = voucherSchema;
