import { IsString, IsOptional, IsObject } from "class-validator";

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  externalTransactionId?: string;

  @IsOptional()
  @IsObject()
  providerData?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  notes?: string;
}
