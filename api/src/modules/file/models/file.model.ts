import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class FileModel extends Document {
  _id: ObjectId;

  type: string;

  name: string;

  description: string;

  mimeType: string;

  server: string;

  path: string;

  absolutePath: string;

  width: number;

  height: number;

  size: number;

  status: string;

  acl: string;

  metadata: any;

  thumbnailPath: string;

  thumbnailAbsolutePath: string;

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
