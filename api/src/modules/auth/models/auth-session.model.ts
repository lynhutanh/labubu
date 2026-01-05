import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class AuthSessionModel extends Document {
  _id: ObjectId;

  source: string;

  sourceId: ObjectId;

  token: string;

  expiryAt: Date;

  createdAt: Date;

  updatedAt: Date;
}
