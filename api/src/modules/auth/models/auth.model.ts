import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class AuthModel extends Document {
  _id: ObjectId;

  source: string;

  sourceId: ObjectId;

  type: string;

  key: string;

  value: string;

  salt: string;

  createdAt: Date;

  updatedAt: Date;
}
