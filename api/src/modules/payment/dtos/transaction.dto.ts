import { Expose, Transform } from "class-transformer";
import { ObjectId } from "mongodb";

export class TransactionDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose()
  transactionId: string;

  @Expose()
  orderId: string;

  @Expose()
  orderNumber?: string;

  @Expose()
  externalTransactionId?: string;

  @Expose()
  @Transform(({ obj }) => obj.userId)
  userId: ObjectId;

  @Expose()
  @Transform(({ obj }) => obj.sellerId)
  sellerId?: ObjectId;

  @Expose()
  amount: number;

  @Expose()
  currency: string;

  @Expose()
  description?: string;

  @Expose()
  paymentMethod: string;

  @Expose()
  paymentProvider?: string;

  @Expose()
  status: string;

  @Expose()
  providerData?: Record<string, unknown>;

  @Expose()
  ipAddress?: string;

  @Expose()
  userAgent?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  completedAt?: Date;

  @Expose()
  failedAt?: Date;

  @Expose()
  notes?: string;

  @Expose()
  isSuccessful?: boolean;

  @Expose()
  isPending?: boolean;

  @Expose()
  isFailed?: boolean;

  constructor(init?: any) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
