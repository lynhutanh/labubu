import { Expose, Transform }from 'class-transformer';
import { ObjectId }from 'mongodb';

export class VoucherDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose() code: string;
  @Expose() name: string;
  @Expose() description: string;
  @Expose() type: string;
  @Expose() value: number;
  @Expose() minOrderAmount: number;
  @Expose() maxDiscountAmount: number;
  @Expose() totalQuantity: number;
  @Expose() usedQuantity: number;
  @Expose() startDate: Date;
  @Expose() endDate: Date;
  @Expose() applicableCategories: string[];
  @Expose() applicableProducts: string[];
  @Expose() applicableUsers: string[];
  @Expose() maxUsesPerUser: number;
  @Expose() status: string;
  @Expose() image: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }

  get remainingQuantity(): number {
    return this.totalQuantity - this.usedQuantity;
  }
}

export class VoucherSearchResponseDto {
  @Expose() vouchers: VoucherDto[];
  @Expose() total: number;
  @Expose() page: number;
  @Expose() limit: number;
  @Expose() totalPages: number;

  constructor(init?: Partial<VoucherSearchResponseDto>) {
    if (init) {
      this.vouchers = init.vouchers || [];
      this.total = init.total || 0;
      this.page = init.page || 1;
      this.limit = init.limit || 20;
      this.totalPages = Math.ceil(this.total / this.limit);
    }
  }
}

export class VoucherStatsDto {
  @Expose() totalVouchers: number;
  @Expose() activeVouchers: number;
  @Expose() expiredVouchers: number;
  @Expose() inactiveVouchers: number;

  constructor(init?: Partial<VoucherStatsDto>) {
    if (init) Object.assign(this, init);
  }
}
