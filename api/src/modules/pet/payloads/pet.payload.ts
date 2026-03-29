import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

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
