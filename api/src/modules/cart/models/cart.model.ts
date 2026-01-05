import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface ICartItem {
  productId: ObjectId;
  quantity: number;
  addedAt: Date;
}

export class CartModel extends Document {
  _id: ObjectId;

  ownerId: ObjectId;

  ownerType: string;

  items: ICartItem[];

  totalItems: number;

  createdAt: Date;

  updatedAt: Date;
}
