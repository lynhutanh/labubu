import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class WalletTransactionModel extends Document {
  _id: ObjectId;

  transactionCode: string;

  walletId: ObjectId;

  ownerId: ObjectId;

  ownerType: string;

  type: string;

  amount: number;

  balanceBefore: number;

  balanceAfter: number;

  currency: string;

  status: string;

  description: string;

  referenceId: string;

  referenceType: string;

  metadata: any;

  completedAt: Date | null;

  failedAt: Date | null;

  failedReason: string;

  createdAt: Date;

  updatedAt: Date;
}
