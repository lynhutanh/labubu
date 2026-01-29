import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class RefundRequestModel extends Document {
  _id: ObjectId;

  orderId: ObjectId;

  orderNumber: string;

  userId: ObjectId;

  amount: number;

  reason?: string;

  status: string;

  processedBy?: ObjectId;

  processedAt?: Date;

  adminNote?: string;

  createdAt: Date;

  updatedAt: Date;
}
