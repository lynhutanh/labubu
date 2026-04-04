import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CreatePetPayload {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsNumber()
  @Min(0)
  order: number;

  @IsNumber()
  @Min(0)
  minPoints: number;

  @IsNumber()
  @Min(0)
  crackPoints: number;

  @IsNumber()
  @Min(0)
  maxPoints: number;

  @IsString()
  @IsOptional()
  eggImage?: string;

  @IsString()
  @IsOptional()
  crackImage?: string;

  @IsString()
  @IsOptional()
  hatchImage?: string;

  @IsNumber()
  @Min(0)
  rewardPoints: number;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class UpdatePetPayload {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minPoints?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  crackPoints?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPoints?: number;

  @IsString()
  @IsOptional()
  eggImage?: string;

  @IsString()
  @IsOptional()
  crackImage?: string;

  @IsString()
  @IsOptional()
  hatchImage?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rewardPoints?: number;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class ChestPrizePayload {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  rewardPoints: number;

  @IsNumber()
  @Min(0.000001)
  weight: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  id?: string;
}

export class UpdatePetChestConfigPayload {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @Min(1)
  openCostPoints: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChestPrizePayload)
  prizes: ChestPrizePayload[];
}

export class AdminPetChestHistorySearchPayload {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsEnum(["pending", "shipped", "delivered"])
  @IsOptional()
  deliveryStatus?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}

export class UpdatePetChestHistoryDeliveryPayload {
  @IsEnum(["pending", "shipped", "delivered"])
  deliveryStatus: "pending" | "shipped" | "delivered";

  @IsString()
  @IsOptional()
  note?: string;
}
