import { Expose, Transform } from "class-transformer";
import { ObjectId } from "mongodb";
import { RefundRequestModel } from "../models";

export class RefundRequestDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose()
  orderId: ObjectId;

  @Expose()
  orderNumber: string;

  @Expose()
  userId: ObjectId;

  @Expose()
  amount: number;

  @Expose()
  reason?: string;

  @Expose()
  status: string;

  @Expose()
  processedBy?: ObjectId;

  @Expose()
  processedAt?: Date;

  @Expose()
  adminNote?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(init?: RefundRequestModel | any) {
    if (init) {
      this._id = init._id || init.id;
      this.orderId = init.orderId ? (typeof init.orderId === 'object' ? init.orderId._id || init.orderId : init.orderId) : undefined;
      this.orderNumber = init.orderNumber || "";
      this.userId = init.userId ? (typeof init.userId === 'object' ? init.userId._id || init.userId : init.userId) : undefined;
      this.amount = init.amount || 0;
      this.reason = init.reason || "";
      this.status = init.status || "";
      this.processedBy = init.processedBy ? (typeof init.processedBy === 'object' ? init.processedBy._id || init.processedBy : init.processedBy) : undefined;
      this.processedAt = init.processedAt ? new Date(init.processedAt) : undefined;
      this.adminNote = init.adminNote || "";
      this.createdAt = init.createdAt ? new Date(init.createdAt) : new Date();
      this.updatedAt = init.updatedAt ? new Date(init.updatedAt) : new Date();
    }
  }

  toResponse() {
    return {
      _id: this._id,
      orderId: this.orderId,
      orderNumber: this.orderNumber,
      userId: this.userId,
      amount: this.amount,
      reason: this.reason,
      status: this.status,
      processedBy: this.processedBy,
      processedAt: this.processedAt,
      adminNote: this.adminNote,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class RefundRequestSearchResponseDto {
  @Expose()
  requests: RefundRequestDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;

  constructor(init?: Partial<RefundRequestSearchResponseDto>) {
    if (init) {
      this.requests = init.requests || [];
      this.total = init.total || 0;
      this.page = init.page || 1;
      this.limit = init.limit || 20;
      this.totalPages = Math.ceil(this.total / this.limit);
    }
  }
}
