import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class MessageModel extends Document {
  _id: ObjectId;

  userId: ObjectId;

  adminId?: ObjectId;

  content: string;

  isFromAdmin: boolean;

  read: boolean;

  metadata?: any;

  createdAt: Date;

  updatedAt: Date;
}
