import {
  IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsArray, IsDate, Min,
}from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateVoucherPayload {
  @IsNotEmpty() @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  code: string;

  @IsNotEmpty() @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsNotEmpty() @IsEnum(['percentage', 'fixed', 'shipping'])
  type: string;

  @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  value: number;

  @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  minOrderAmount: number;

  @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  maxDiscountAmount: number;

  @IsNumber() @Min(1)
  @Transform(({ value }) => Number(value))
  totalQuantity: number;

  @Type(() => Date) @IsDate()
  startDate: Date;

  @Type(() => Date) @IsDate()
  endDate: Date;

  @IsOptional() @IsArray()
  applicableCategories?: string[];

  @IsOptional() @IsArray()
  applicableProducts?: string[];

  @IsOptional() @IsArray()
  applicableUsers?: string[];

  @IsOptional() @IsNumber() @Min(1)
  @Transform(({ value }) => Number(value))
  maxUsesPerUser?: number;

  @IsOptional() @IsString()
  image?: string;
}

export class UpdateVoucherPayload {
  @IsOptional() @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  code?: string;

  @IsOptional() @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(['percentage', 'fixed', 'shipping'])
  type?: string;

  @IsOptional() @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  value?: number;

  @IsOptional() @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  minOrderAmount?: number;

  @IsOptional() @IsNumber() @Min(0)
  @Transform(({ value }) => Number(value))
  maxDiscountAmount?: number;

  @IsOptional() @IsNumber() @Min(1)
  @Transform(({ value }) => Number(value))
  totalQuantity?: number;

  @IsOptional() @Type(() => Date) @IsDate()
  startDate?: Date;

  @IsOptional() @Type(() => Date) @IsDate()
  endDate?: Date;

  @IsOptional() @IsArray()
  applicableCategories?: string[];

  @IsOptional() @IsArray()
  applicableProducts?: string[];

  @IsOptional() @IsArray()
  applicableUsers?: string[];

  @IsOptional() @IsNumber() @Min(1)
  @Transform(({ value }) => Number(value))
  maxUsesPerUser?: number;

  @IsOptional() @IsEnum(['active', 'inactive', 'expired'])
  status?: string;

  @IsOptional() @IsString()
  image?: string;
}

export class VoucherSearchPayload {
  @IsOptional() @IsString()
  keyword?: string;

  @IsOptional() @IsEnum(['active', 'inactive', 'expired'])
  status?: string;

  @IsOptional() @IsEnum(['percentage', 'fixed', 'shipping'])
  type?: string;

  @IsOptional() @IsNumber() @Type(() => Number)
  page?: number = 1;

  @IsOptional() @IsNumber() @Type(() => Number)
  limit?: number = 20;

  @IsOptional() @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional() @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class VoucherBulkOperationPayload {
  @IsArray()
  voucherIds: string[];

  @IsString()
  action: string;
}
