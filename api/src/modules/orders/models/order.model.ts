import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface IOrderItem {
  productId: ObjectId;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  quantity: number;
  subtotal: number;
  coverImage?: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  city: string;
  note?: string;
}

export class OrderModel extends Document {
  _id: ObjectId;

  orderNumber: string;

  buyerId: ObjectId;

  buyerType: string;

  items: IOrderItem[];

  totalItems: number;

  subtotal: number;

  shippingFee: number;

  discount: number;

  total: number;

  shippingAddress: IShippingAddress;

  paymentMethod: string;

  paymentStatus: string;

  walletTransactionId?: ObjectId;

  paymentTransactionId?: ObjectId;

  paidAt?: Date;

  status: string;

  cancelReason?: string;

  cancelledAt?: Date;

  confirmedAt?: Date;

  shippedAt?: Date;

  deliveredAt?: Date;

  completedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}
