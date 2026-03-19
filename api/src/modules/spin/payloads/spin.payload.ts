import { IsString, IsArray, IsDateString, IsOptional, IsEnum, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class SpinSlotPayload {
  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;

  @IsEnum(['prize', 'lose'])
  type: string;
}

export class CreateSpinConfigPayload {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpinSlotPayload)
  slots: SpinSlotPayload[];

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  minSpentAmount: number;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class UpdateSpinConfigPayload {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpinSlotPayload)
  @IsOptional()
  slots?: SpinSlotPayload[];

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

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class SpinResultSearchPayload {
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

export class SubmitSpinInfoPayload {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  address: string;
}

export class PlaySpinPayload {
  @IsString()
  phone: string;
}

export class UpdateDeliveryStatusPayload {
  @IsEnum(['pending', 'shipped', 'delivered'])
  deliveryStatus: string;

  @IsString()
  @IsOptional()
  note?: string;
}
