import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export class WalletModel extends Document {
  _id: ObjectId;

  ownerId: ObjectId;

  ownerType: string;

  balance: number;

  currency: string;

  status: string;

  totalDeposited: number;

  totalWithdrawn: number;

  totalSpent: number;

  lastTransactionAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
}
