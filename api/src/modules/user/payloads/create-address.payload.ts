import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsNumber } from "class-validator";

export class CreateAddressPayload {
  @ApiProperty({ description: "Full name", required: true })
  @IsString()
  fullName: string;

  @ApiProperty({ description: "Phone number", required: true })
  @IsString()
  phone: string;

  @ApiProperty({ description: "Address detail", required: true })
  @IsString()
  address: string;

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

  @ApiProperty({ description: "City/Province name", required: true })
  @IsString()
  city: string;

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
