import { Schema } from "mongoose";
import { ROLE, STATUS } from "../constants";

export const UserSchema = new Schema(
  {
    name: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      index: true,
      unique: true,
      trim: true,
      sparse: true,
    },
    email: {
      type: String,
      index: true,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: ROLE.USER,
      enum: ["admin", "user", "seller"],
    },
    avatarId: {
      type: Schema.Types.ObjectId,
      sparse: true,
      default: null,
    },
    avatarPath: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: STATUS.ACTIVE,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      index: true,
    },
    address: {
      type: String,
      default: "",
    },
    rank: {
      type: String,
      default: "new_member",
      enum: ["new_member", "copper", "silver", "gold", "platinum", "diamond", "emerald"],
      index: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    receivedRewards: {
      type: [String],
      default: [],
    },
    petBalance: {
      type: Number,
      default: 0,
    },
    bonusPetPoints: {
      type: Number,
      default: 0,
    },
    petChestPointsSpent: {
      type: Number,
      default: 0,
    },
    petChestHistory: {
      type: [
        {
          prizeId: { type: String, default: "" },
          prizeName: { type: String, default: "" },
          prizeImage: { type: String, default: "" },
          rewardPoints: { type: Number, default: 0 },
          rewardVnd: { type: Number, default: 0 },
          openCostPoints: { type: Number, default: 0 },
          deliveryStatus: {
            type: String,
            enum: ["pending", "shipped", "delivered"],
            default: "pending",
            index: true,
          },
          note: { type: String, default: "" },
          openedAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);
