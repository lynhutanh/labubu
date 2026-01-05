import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  MinLength,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
  Matches,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateSubcategoryPayload {
  @ApiProperty({ description: "Subcategory name", example: "Son môi" })
  @IsNotEmpty({ message: "Tên danh mục con là bắt buộc" })
  @IsString({ message: "Tên danh mục con phải là chuỗi" })
  @MinLength(2, { message: "Tên danh mục con phải có ít nhất 2 ký tự" })
  @MaxLength(100, { message: "Tên danh mục con không được quá 100 ký tự" })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ description: "Subcategory slug", required: false })
  @IsOptional()
  @IsString({ message: "Slug danh mục con phải là chuỗi" })
  @Transform(({ value }) => value?.trim().toLowerCase())
  slug?: string;

  @ApiProperty({ description: "Subcategory description", required: false })
  @IsOptional()
  @IsString({ message: "Mô tả danh mục con phải là chuỗi" })
  @MaxLength(500, { message: "Mô tả danh mục con không được quá 500 ký tự" })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: "Subcategory status",
    enum: ["active", "inactive"],
    default: "active",
  })
  @IsOptional()
  @IsEnum(["active", "inactive"], {
    message: "Trạng thái phải là active hoặc inactive",
  })
  status?: "active" | "inactive" = "active";

  @ApiProperty({ description: "Sort order", default: 0 })
  @IsOptional()
  @IsNumber({}, { message: "Thứ tự sắp xếp phải là số" })
  @Min(0, { message: "Thứ tự sắp xếp phải >= 0" })
  @Transform(({ value }) => parseInt(value, 10) || 0)
  sortOrder?: number = 0;
}

export class CreateCategoryPayload {
  @ApiProperty({ description: "Category name", example: "Trang điểm" })
  @IsNotEmpty({ message: "Tên danh mục là bắt buộc" })
  @IsString({ message: "Tên danh mục phải là chuỗi" })
  @MinLength(2, { message: "Tên danh mục phải có ít nhất 2 ký tự" })
  @MaxLength(100, { message: "Tên danh mục không được quá 100 ký tự" })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: "Category slug",
    example: "trang-diem",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Slug phải là chuỗi" })
  @Matches(/^[a-z0-9-]+$/, {
    message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
  })
  @MaxLength(100, { message: "Slug không được quá 100 ký tự" })
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
    default: "active",
  })
  @IsOptional()
  @IsEnum(["active", "inactive"], {
    message: "Trạng thái phải là active hoặc inactive",
  })
  status?: "active" | "inactive" = "active";

  @ApiProperty({ description: "Sort order", default: 0 })
  @IsOptional()
  @IsNumber({}, { message: "Thứ tự sắp xếp phải là số" })
  @Min(0, { message: "Thứ tự sắp xếp phải >= 0" })
  @Transform(({ value }) => parseInt(value, 10) || 0)
  sortOrder?: number = 0;

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
