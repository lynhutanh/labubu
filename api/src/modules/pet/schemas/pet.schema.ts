import { Schema } from 'mongoose';

export const petSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    backgroundImage: { type: String, default: '' },
    order: { type: Number, required: true, min: 0, index: true },
    minPoints: { type: Number, required: true, min: 0 },
    crackPoints: { type: Number, required: true, min: 0 },
    maxPoints: { type: Number, required: true, min: 0 },
    eggImage: { type: String, default: '' },
    crackImage: { type: String, default: '' },
    hatchImage: { type: String, default: '' },
    rewardPoints: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

petSchema.index({ order: 1 });
petSchema.index({ minPoints: 1, maxPoints: 1 });
petSchema.index({ createdAt: -1 });

export const PetSchema = petSchema;
