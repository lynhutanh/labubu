import { IsString, IsArray, IsDateString, IsOptional, IsEnum, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class SlotMachineSymbolPayload {
  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class SlotMachinePrizePayload {
  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class CreateSlotMachineConfigPayload {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotMachineSymbolPayload)
  symbols: SlotMachineSymbolPayload[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotMachinePrizePayload)
  prizes: SlotMachinePrizePayload[];

  @IsNumber()
  @Min(0)
  @Max(100)
  winRate: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  minSpentAmount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxSpinsPerUser?: number;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class UpdateSlotMachineConfigPayload {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotMachineSymbolPayload)
  @IsOptional()
  symbols?: SlotMachineSymbolPayload[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotMachinePrizePayload)
  @IsOptional()
  prizes?: SlotMachinePrizePayload[];

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  winRate?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minSpentAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxSpinsPerUser?: number;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class SlotMachineResultSearchPayload {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  deliveryStatus?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;
}

export class SubmitSlotMachineInfoPayload {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  address: string;
}

export class UpdateSlotMachineDeliveryStatusPayload {
  @IsEnum(['pending', 'shipped', 'delivered'])
  deliveryStatus: string;

  @IsString()
  @IsOptional()
  note?: string;
}
