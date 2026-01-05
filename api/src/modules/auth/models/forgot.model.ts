import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class ForgotModel extends Document {
  _id: ObjectId;

  token: string;

  source: string;

  sourceId: ObjectId;

  authId: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
