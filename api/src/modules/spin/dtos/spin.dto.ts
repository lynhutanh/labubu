import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class SpinSlotDto {
  @Expose() label: string;
  @Expose() image: string;
  @Expose() rate: number;
  @Expose() type: string;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class SpinConfigDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose() name: string;
  @Expose() slots: SpinSlotDto[];
  @Expose() startDate: Date;
  @Expose() endDate: Date;
  @Expose() minSpentAmount: number;
  @Expose() status: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class SpinResultDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose() configId: ObjectId;
  @Expose() buyerPhone: string;
  @Expose() slotIndex: number;
  @Expose() slotLabel: string;
  @Expose() slotImage: string;
  @Expose() type: string;
  @Expose() fullName: string;
  @Expose() phone: string;
  @Expose() email: string;
  @Expose() address: string;
  @Expose() deliveryStatus: string;
  @Expose() note: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class SpinResultSearchResponseDto {
  @Expose() results: SpinResultDto[];
  @Expose() total: number;
  @Expose() page: number;
  @Expose() limit: number;
  @Expose() totalPages: number;

  constructor(init?: Partial<SpinResultSearchResponseDto>) {
    if (init) {
      this.results = init.results || [];
      this.total = init.total || 0;
      this.page = init.page || 1;
      this.limit = init.limit || 20;
      this.totalPages = Math.ceil(this.total / this.limit);
    }
  }
}
