import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class VerificationModel extends Document {
  _id: ObjectId;

  token: string;

  value: string;

  sourceId: ObjectId;

  sourceType: string;

  verified: boolean;

  createdAt: Date;

  updatedAt: Date;
}
