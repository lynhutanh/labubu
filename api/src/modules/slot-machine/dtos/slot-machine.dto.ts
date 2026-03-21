import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class SlotMachineSymbolDto {
  @Expose() label: string;
  @Expose() image: string;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class SlotMachinePrizeDto {
  @Expose() label: string;
  @Expose() image: string;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class SlotMachineJackpotComboDto {
  @Expose() symbolIndex: number;
  @Expose() prizeLabel: string;
  @Expose() prizeImage: string;
  @Expose() rate: number;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}

export class SlotMachineConfigDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose() name: string;
  @Expose() symbols: SlotMachineSymbolDto[];
  @Expose() prizes: SlotMachinePrizeDto[];
  @Expose() jackpotCombos: SlotMachineJackpotComboDto[];
  @Expose() winRate: number;
  @Expose() startDate: Date;
  @Expose() endDate: Date;
  @Expose() minSpentAmount: number;
  @Expose() maxSpinsPerUser: number;
  @Expose() status: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  constructor(init?: any) {
    if (init) Object.assign(this, init);
  }
}


export class SlotMachineResultDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose() configId: ObjectId;
  @Expose() buyerId: ObjectId;
  @Expose() reels: number[];
  @Expose() type: string;
  @Expose() prizeLabel: string;
  @Expose() prizeImage: string;
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

export class SlotMachineResultSearchResponseDto {
  @Expose() results: SlotMachineResultDto[];
  @Expose() total: number;
  @Expose() page: number;
  @Expose() limit: number;
  @Expose() totalPages: number;

  constructor(init?: Partial<SlotMachineResultSearchResponseDto>) {
    if (init) {
      this.results = init.results || [];
      this.total = init.total || 0;
      this.page = init.page || 1;
      this.limit = init.limit || 20;
      this.totalPages = Math.ceil(this.total / this.limit);
    }
  }
}
