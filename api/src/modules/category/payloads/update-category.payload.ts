import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  MinLength,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { CreateSubcategoryPayload } from "./create-category.payload";

export class UpdateCategoryPayload {
  @ApiProperty({ description: "Category name", required: false })
  @IsOptional()
  @IsString({ message: "Tên danh mục phải là chuỗi" })
  @MinLength(2, { message: "Tên danh mục phải có ít nhất 2 ký tự" })
  @MaxLength(100, { message: "Tên danh mục không được quá 100 ký tự" })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({ description: "Category slug", required: false })
  @IsOptional()
  @IsString({ message: "Slug phải là chuỗi" })
  @Transform(({ value }) => value?.trim().toLowerCase())
  slug?: string;

  @ApiProperty({ description: "Category description", required: false })
  @IsOptional()
  @IsString({ message: "Mô tả phải là chuỗi" })
  @MaxLength(500, { message: "Mô tả không được quá 500 ký tự" })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ description: "Category icon (emoji)", required: false })
  @IsOptional()
  @IsString({ message: "Icon danh mục phải là chuỗi" })
  icon?: string;

  @ApiProperty({ description: "Category image URL", required: false })
  @IsOptional()
  @IsString({ message: "Hình ảnh danh mục phải là chuỗi" })
  image?: string;

  @ApiProperty({
    description: "Category status",
    enum: ["active", "inactive"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["active", "inactive"], {
    message: "Trạng thái phải là active hoặc inactive",
  })
  status?: "active" | "inactive";

  @ApiProperty({ description: "Sort order", required: false })
  @IsOptional()
  @IsNumber({}, { message: "Thứ tự sắp xếp phải là số" })
  @Min(0, { message: "Thứ tự sắp xếp phải >= 0" })
  @Transform(({ value }) => parseInt(value, 10) || 0)
  sortOrder?: number;

  @ApiProperty({
    description: "Subcategories",
    type: [CreateSubcategoryPayload],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Danh mục con phải là mảng" })
  @ValidateNested({ each: true })
  @Type(() => CreateSubcategoryPayload)
  subcategories?: CreateSubcategoryPayload[];
}
