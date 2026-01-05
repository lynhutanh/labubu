import { ObjectId } from "mongodb";

export interface IOrderFilter {
  _id?: ObjectId | string;
  buyerId?: ObjectId | string;
  buyerType?: string;
  status?: string | { $in: string[] };
  paymentStatus?: string;
  "items.shopId"?: ObjectId | string;
  $or?: Array<Record<string, any>>;
}

export interface IOrderSortOptions {
  [key: string]: 1 | -1;
}

export interface IOrderUpdateData {
  status?: string;
  paymentStatus?: string;
  cancelReason?: string;
  cancelledAt?: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  updatedAt?: Date;
}

export interface ICreateOrderItem {
  productId: string;
  quantity: number;
}

export interface IShippingAddressInput {
  fullName: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  city: string;
  note?: string;
}
