import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsObject,
} from "class-validator";
import { PAYMENT_METHOD, PAYMENT_PROVIDER } from "../constants";

export class CreateTransactionDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  sellerId?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = "VND";

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Object.values(PAYMENT_METHOD))
  paymentMethod: string;

  @IsOptional()
  @IsEnum(Object.values(PAYMENT_PROVIDER))
  paymentProvider?: string;

  @IsOptional()
  @IsString()
  externalTransactionId?: string;

  @IsOptional()
  @IsObject()
  providerData?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
