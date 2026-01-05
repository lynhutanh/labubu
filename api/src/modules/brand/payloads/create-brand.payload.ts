import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsEnum,
} from "class-validator";
import { Transform } from "class-transformer";
import { BRAND_STATUS } from "../constants";

export class CreateBrandPayload {
  @ApiProperty({ description: "Brand name", example: "L'Oreal" })
  @IsNotEmpty({ message: "Tên nhãn hàng là bắt buộc" })
  @IsString({ message: "Tên nhãn hàng phải là chuỗi" })
  @MinLength(2, { message: "Tên nhãn hàng phải có ít nhất 2 ký tự" })
  @MaxLength(200, { message: "Tên nhãn hàng không được quá 200 ký tự" })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ description: "Brand slug", required: false })
  @IsOptional()
  @IsString({ message: "Slug phải là chuỗi" })
  @MaxLength(200, { message: "Slug không được quá 200 ký tự" })
  @Transform(({ value }) => value?.trim().toLowerCase())
  slug?: string;

  @ApiProperty({ description: "Brand description", required: false })
  @IsOptional()
  @IsString({ message: "Mô tả phải là chuỗi" })
  @MaxLength(1000, { message: "Mô tả không được quá 1000 ký tự" })
  description?: string;

  @ApiProperty({ description: "Logo file ID", required: false })
  @IsOptional()
  @IsMongoId({ message: "ID file không hợp lệ" })
  fileId?: string;

  @ApiProperty({ description: "Brand website", required: false })
  @IsOptional()
  @IsString({ message: "Website phải là chuỗi" })
  @MaxLength(255, { message: "Website không được quá 255 ký tự" })
  website?: string;

  @ApiProperty({ description: "Brand origin country", required: false })
  @IsOptional()
  @IsString({ message: "Xuất xứ phải là chuỗi" })
  @MaxLength(100, { message: "Xuất xứ không được quá 100 ký tự" })
  origin?: string;

  @ApiProperty({
    description: "Brand status",
    enum: Object.values(BRAND_STATUS),
    default: "active",
  })
  @IsOptional()
  @IsEnum(Object.values(BRAND_STATUS), { message: "Trạng thái không hợp lệ" })
  status?: string;

  @ApiProperty({ description: "Sort order", default: 0 })
  @IsOptional()
  @IsNumber({}, { message: "Thứ tự phải là số" })
  @Transform(({ value }) => parseInt(value, 10) || 0)
  sortOrder?: number;
}
