import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class BrandModel extends Document {
  _id: ObjectId;

  name: string;

  slug: string;

  description?: string;

  fileId?: ObjectId;

  website?: string;

  origin?: string;

  status: "active" | "inactive";

  sortOrder: number;

  createdAt: Date;

  updatedAt: Date;
}




