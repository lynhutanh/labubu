import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface IWishlistItem {
  productId: ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  _id: ObjectId;
  ownerId: ObjectId;
  ownerType: string;
  items: IWishlistItem[];
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

export type WishlistModel = IWishlist;
