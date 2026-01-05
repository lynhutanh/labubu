import { ObjectId } from "mongodb";

export interface ICartFilter {
  ownerId?: any;
  ownerType?: string;
  [key: string]: any;
}

export interface ICartItemPopulated {
  productId: ObjectId;
  quantity: number;
  addedAt: Date;
  product?: any;
}
