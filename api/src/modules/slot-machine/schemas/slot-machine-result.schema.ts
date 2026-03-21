import { Schema } from 'mongoose';

export const slotMachineResultSchema = new Schema(
  {
    configId: { type: Schema.Types.ObjectId, ref: 'slotmachineconfig', required: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, default: null, index: true },
    reels: [{ type: Number, required: true }],
    type: { type: String, enum: ['prize', 'lose'], required: true },
    prizeLabel: { type: String, default: '' },
    prizeImage: { type: String, default: '' },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending', index: true },
    note: { type: String, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

slotMachineResultSchema.index({ createdAt: -1 });
slotMachineResultSchema.index({ type: 1 });

export const SlotMachineResultSchema = slotMachineResultSchema;
