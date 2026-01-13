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
  },
  { timestamps: true },
);
