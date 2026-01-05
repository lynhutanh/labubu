import { Document } from "mongoose";
import { ObjectId } from "mongodb";
import {
  TransactionStatus,
  PaymentMethod,
  PaymentProvider,
} from "../constants";

export class TransactionModel extends Document {
  _id: ObjectId;

  transactionId: string;

  orderId: string;

  orderNumber?: string;

  externalTransactionId?: string;

  userId: ObjectId;

  sellerId?: ObjectId;

  amount: number;

  currency: string;

  description?: string;

  paymentMethod: PaymentMethod;

  paymentProvider?: PaymentProvider;

  status: TransactionStatus;

  providerData?: Record<string, unknown>;

  ipAddress?: string;

  userAgent?: string;

  createdAt: Date;

  updatedAt: Date;

  completedAt?: Date;

  failedAt?: Date;

  notes?: string;

  isSuccessful?: boolean;

  isPending?: boolean;

  isFailed?: boolean;
}
