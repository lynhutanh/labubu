import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class AddressModel extends Document {
  _id: ObjectId;

  userId: ObjectId;

  fullName: string;

  phone: string;

  address: string;

  ward?: string;

  wardCode?: string;

  district?: string;

  districtId?: number;

  city: string;

  provinceId?: number;

  isDefault: boolean;

  note?: string;

  createdAt: Date;

  updatedAt: Date;
}
