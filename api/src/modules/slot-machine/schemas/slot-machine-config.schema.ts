import { Schema } from 'mongoose';

export const slotMachineConfigSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    symbols: [
      {
        label: { type: String, required: true },
        image: { type: String, default: '' },
      },
    ],
    prizes: [
      {
        label: { type: String, required: true },
        image: { type: String, default: '' },
      },
    ],
    jackpotCombos: [
      {
        symbolIndex: { type: Number, required: true },
        prizeLabel: { type: String, required: true },
        prizeImage: { type: String, default: '' },
        rate: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    winRate: { type: Number, required: true, min: 0, max: 100, default: 5 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    minSpentAmount: { type: Number, required: true, default: 0, min: 0 },
    maxSpinsPerUser: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

slotMachineConfigSchema.index({ status: 1, startDate: 1, endDate: 1 });
slotMachineConfigSchema.index({ createdAt: -1 });

export const SlotMachineConfigSchema = slotMachineConfigSchema;
