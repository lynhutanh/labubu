import { Schema } from 'mongoose';

export const userPetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    petId: { type: Schema.Types.ObjectId, ref: 'pet', required: true, index: true },
    currentStage: { type: Number, default: 0, min: 0 },
    isCompleted: { type: Boolean, default: false, index: true },
    rewardClaimed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userPetSchema.index({ userId: 1, petId: 1 }, { unique: true });
userPetSchema.index({ userId: 1, isCompleted: 1 });
userPetSchema.index({ createdAt: -1 });

export const UserPetSchema = userPetSchema;
