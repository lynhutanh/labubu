import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsNumber } from "class-validator";

export class UpdateAddressPayload {
  @ApiProperty({ description: "Full name", required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ description: "Phone number", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: "Address detail", required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: "Ward name", required: false })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiProperty({ description: "Ward code", required: false })
  @IsString()
  @IsOptional()
  wardCode?: string;

  @ApiProperty({ description: "District name", required: false })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ description: "District ID", required: false })
  @IsNumber()
  @IsOptional()
  districtId?: number;

  @ApiProperty({ description: "City/Province name", required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: "Province ID", required: false })
  @IsNumber()
  @IsOptional()
  provinceId?: number;

  @ApiProperty({ description: "Is default address", required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ description: "Note", required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
