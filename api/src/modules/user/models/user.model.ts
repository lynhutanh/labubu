import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class UserModel extends Document {
  _id: ObjectId;

  name?: string;

  username?: string;

  email?: string;

  phone?: string;

  role: string;

  avatarId?: ObjectId;

  avatarPath?: string;

  status: string;

  dateOfBirth?: Date;

  gender?: string;

  address?: string;

  createdAt: Date;

  updatedAt: Date;
}
