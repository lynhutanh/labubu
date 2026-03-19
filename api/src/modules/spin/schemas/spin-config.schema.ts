import { Schema } from 'mongoose';

export const spinConfigSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slots: [
      {
        label: { type: String, required: true },
        image: { type: String, default: '' },
        rate: { type: Number, required: true, min: 0, max: 100 },
        type: { type: String, enum: ['prize', 'lose'], required: true },
      },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    minSpentAmount: { type: Number, required: true, default: 0, min: 0 },
    maxSpinsPerUser: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

spinConfigSchema.index({ status: 1, startDate: 1, endDate: 1 });
spinConfigSchema.index({ createdAt: -1 });

export const SpinConfigSchema = spinConfigSchema;
