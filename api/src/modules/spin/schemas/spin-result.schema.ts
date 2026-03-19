import { Schema } from 'mongoose';

export const spinResultSchema = new Schema(
  {
    configId: { type: Schema.Types.ObjectId, ref: 'spinconfig', required: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, default: null, index: true },
    buyerPhone: { type: String, default: '', index: true },
    slotIndex: { type: Number, required: true },
    slotLabel: { type: String, required: true },
    slotImage: { type: String, default: '' },
    type: { type: String, enum: ['prize', 'lose'], required: true },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending', index: true },
    note: { type: String, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

spinResultSchema.index({ createdAt: -1 });
spinResultSchema.index({ type: 1 });

export const SpinResultSchema = spinResultSchema;
