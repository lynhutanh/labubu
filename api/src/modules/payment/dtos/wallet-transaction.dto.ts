import { ObjectId } from "mongodb";

export class WalletTransactionDto {
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

  constructor(data: any) {
    this._id = data._id;
    this.transactionCode = data.transactionCode;
    this.walletId = data.walletId;
    this.ownerId = data.ownerId;
    this.ownerType = data.ownerType;
    this.type = data.type;
    this.amount = data.amount;
    this.balanceBefore = data.balanceBefore;
    this.balanceAfter = data.balanceAfter;
    this.currency = data.currency || "VND";
    this.status = data.status;
    this.description = data.description || "";
    this.referenceId = data.referenceId;
    this.referenceType = data.referenceType;
    this.metadata = data.metadata || {};
    this.completedAt = data.completedAt;
    this.failedAt = data.failedAt;
    this.failedReason = data.failedReason || "";
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class WalletTransactionSearchResponseDto {
  data: WalletTransactionDto[];

  total: number;

  limit: number;

  offset: number;

  constructor(
    data: WalletTransactionDto[],
    total: number,
    limit: number,
    offset: number,
  ) {
    this.data = data;
    this.total = total;
    this.limit = limit;
    this.offset = offset;
  }
}
