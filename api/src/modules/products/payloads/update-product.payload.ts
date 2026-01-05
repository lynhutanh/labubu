import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  MinLength,
  Min,
  Max,
  IsEnum,
  IsArray,
  IsBoolean,
  IsMongoId,
  Matches,
} from "class-validator";
import { Transform } from "class-transformer";
import { PRODUCT_TYPE, SKIN_TYPE, PRODUCT_STATUS } from "../constants";

export class UpdateProductPayload {
  @ApiProperty({ description: "Product name", required: false })
  @IsOptional()
  @IsString({ message: "Tên sản phẩm phải là chuỗi" })
  @MinLength(2, { message: "Tên sản phẩm phải có ít nhất 2 ký tự" })
  @MaxLength(200, { message: "Tên sản phẩm không được quá 200 ký tự" })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({ description: "Product slug", required: false })
  @IsOptional()
  @IsString({ message: "Slug phải là chuỗi" })
  @Matches(/^[a-z0-9-]+$/, {
    message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
  })
  @MaxLength(200, { message: "Slug không được quá 200 ký tự" })
  @Transform(({ value }) => value?.trim().toLowerCase())
  slug?: string;

  @ApiProperty({ description: "Product description", required: false })
  @IsOptional()
  @IsString({ message: "Mô tả phải là chuỗi" })
  @MaxLength(5000, { message: "Mô tả không được quá 5000 ký tự" })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ description: "Short description", required: false })
  @IsOptional()
  @IsString({ message: "Mô tả ngắn phải là chuỗi" })
  @MaxLength(500, { message: "Mô tả ngắn không được quá 500 ký tự" })
  @Transform(({ value }) => value?.trim())
  shortDescription?: string;

  @ApiProperty({ description: "Category ID", required: false })
  @IsOptional()
  @IsMongoId({ message: "ID danh mục không hợp lệ" })
  categoryId?: string;

  @ApiProperty({ description: "Subcategory slug", required: false })
  @IsOptional()
  @IsString({ message: "Slug danh mục con phải là chuỗi" })
  subcategorySlug?: string;

  @ApiProperty({ description: "Brand ID", required: false })
  @IsOptional()
  @IsMongoId({ message: "ID thương hiệu không hợp lệ" })
  brandId?: string;

  @ApiProperty({
    description: "Product type",
    enum: Object.values(PRODUCT_TYPE),
    required: false,
  })
  @IsOptional()
  @IsEnum(Object.values(PRODUCT_TYPE), {
    message: "Loại sản phẩm không hợp lệ",
  })
  productType?: string;

  @ApiProperty({ description: "Price", required: false })
  @IsOptional()
  @IsNumber({}, { message: "Giá phải là số" })
  @Min(0, { message: "Giá phải >= 0" })
  @Transform(({ value }) => parseFloat(value) || 0)
  price?: number;

  @ApiProperty({ description: "Sale price", required: false })
  @IsOptional()
  @IsNumber({}, { message: "Giá khuyến mãi phải là số" })
  @Min(0, { message: "Giá khuyến mãi phải >= 0" })
  @Transform(({ value }) => parseFloat(value) || 0)
  salePrice?: number;

  @ApiProperty({ description: "Discount percentage", required: false })
  @IsOptional()
  @IsNumber({}, { message: "Phần trăm giảm giá phải là số" })
  @Min(0, { message: "Phần trăm giảm giá phải >= 0" })
  @Max(100, { message: "Phần trăm giảm giá không quá 100" })
  @Transform(({ value }) => parseFloat(value) || 0)
  discountPercentage?: number;

  @ApiProperty({ description: "Stock quantity", required: false })
  @IsOptional()
  @IsNumber({}, { message: "Số lượng tồn kho phải là số" })
  @Min(0, { message: "Số lượng tồn kho phải >= 0" })
  @Transform(({ value }) => parseInt(value, 10) || 0)
  stock?: number;

  @ApiProperty({ description: "SKU", required: false })
  @IsOptional()
  @IsString({ message: "SKU phải là chuỗi" })
  @Transform(({ value }) => value?.trim())
  sku?: string;

  @ApiProperty({ description: "Barcode", required: false })
  @IsOptional()
  @IsString({ message: "Barcode phải là chuỗi" })
  @Transform(({ value }) => value?.trim())
  barcode?: string;

  @ApiProperty({ description: "File IDs", type: [String], required: false })
  @IsOptional()
  @IsArray({ message: "fileIds phải là mảng" })
  @IsMongoId({ each: true, message: "ID file không hợp lệ" })
  fileIds?: string[];

  @ApiProperty({ description: "Ingredients", required: false })
  @IsOptional()
  @IsString({ message: "Thành phần phải là chuỗi" })
  @MaxLength(2000, { message: "Thành phần không được quá 2000 ký tự" })
  ingredients?: string;

  @ApiProperty({ description: "How to use", required: false })
  @IsOptional()
  @IsString({ message: "Hướng dẫn sử dụng phải là chuỗi" })
  @MaxLength(2000, { message: "Hướng dẫn sử dụng không được quá 2000 ký tự" })
  howToUse?: string;

  @ApiProperty({ description: "Volume", required: false })
  @IsOptional()
  @IsString({ message: "Dung tích phải là chuỗi" })
  @MaxLength(50, { message: "Dung tích không được quá 50 ký tự" })
  volume?: string;

  @ApiProperty({ description: "Weight in grams", required: false })
  @IsOptional()
  @IsNumber({}, { message: "Khối lượng phải là số" })
  @Min(0, { message: "Khối lượng phải >= 0" })
  @Transform(({ value }) => parseFloat(value) || 0)
  weight?: number;

  @ApiProperty({
    description: "Skin types",
    type: [String],
    enum: Object.values(SKIN_TYPE),
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Loại da phải là mảng" })
  @IsEnum(Object.values(SKIN_TYPE), {
    each: true,
    message: "Loại da không hợp lệ",
  })
  skinType?: string[];

  @ApiProperty({ description: "Origin", required: false })
  @IsOptional()
  @IsString({ message: "Xuất xứ phải là chuỗi" })
  @MaxLength(100, { message: "Xuất xứ không được quá 100 ký tự" })
  origin?: string;

  @ApiProperty({ description: "Made in", required: false })
  @IsOptional()
  @IsString({ message: "Nơi sản xuất phải là chuỗi" })
  @MaxLength(100, { message: "Nơi sản xuất không được quá 100 ký tự" })
  madeIn?: string;

  @ApiProperty({ description: "Expiry in months", required: false })
  @IsOptional()
  @IsNumber({}, { message: "Hạn sử dụng phải là số" })
  @Min(1, { message: "Hạn sử dụng phải >= 1 tháng" })
  @Transform(({ value }) => parseInt(value, 10) || 24)
  expiryMonths?: number;

  @ApiProperty({ description: "Meta title for SEO", required: false })
  @IsOptional()
  @IsString({ message: "Meta title phải là chuỗi" })
  @MaxLength(200, { message: "Meta title không được quá 200 ký tự" })
  metaTitle?: string;

  @ApiProperty({ description: "Meta description for SEO", required: false })
  @IsOptional()
  @IsString({ message: "Meta description phải là chuỗi" })
  @MaxLength(500, { message: "Meta description không được quá 500 ký tự" })
  metaDescription?: string;

  @ApiProperty({
    description: "Meta keywords",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Meta keywords phải là mảng" })
  @IsString({ each: true, message: "Keyword phải là chuỗi" })
  metaKeywords?: string[];

  @ApiProperty({
    description: "Product status",
    enum: Object.values(PRODUCT_STATUS),
    required: false,
  })
  @IsOptional()
  @IsEnum(Object.values(PRODUCT_STATUS), {
    message: "Trạng thái không hợp lệ",
  })
  status?: string;

  @ApiProperty({ description: "Featured product", required: false })
  @IsOptional()
  @IsBoolean({ message: "Featured phải là boolean" })
  @Transform(({ value }) => value === true || value === "true")
  featured?: boolean;

  @ApiProperty({ description: "Is new arrival", required: false })
  @IsOptional()
  @IsBoolean({ message: "isNewArrival phải là boolean" })
  @Transform(({ value }) => value === true || value === "true")
  isNewArrival?: boolean;
}
