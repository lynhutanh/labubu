import { ObjectId } from "mongodb";

export class WalletDto {
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

  constructor(data: any) {
    this._id = data._id;
    this.ownerId = data.ownerId;
    this.ownerType = data.ownerType;
    this.balance = data.balance || 0;
    this.currency = data.currency || "VND";
    this.status = data.status;
    this.totalDeposited = data.totalDeposited || 0;
    this.totalWithdrawn = data.totalWithdrawn || 0;
    this.totalSpent = data.totalSpent || 0;
    this.lastTransactionAt = data.lastTransactionAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class WalletBalanceDto {
  balance: number;

  currency: string;

  status: string;

  constructor(data: any) {
    this.balance = data.balance || 0;
    this.currency = data.currency || "VND";
    this.status = data.status;
  }
}

export class WalletStatsDto {
  totalDeposited: number;

  totalWithdrawn: number;

  totalSpent: number;

  currentBalance: number;

  currency: string;

  constructor(data: any) {
    this.totalDeposited = data.totalDeposited || 0;
    this.totalWithdrawn = data.totalWithdrawn || 0;
    this.totalSpent = data.totalSpent || 0;
    this.currentBalance = data.balance || 0;
    this.currency = data.currency || "VND";
  }
}
