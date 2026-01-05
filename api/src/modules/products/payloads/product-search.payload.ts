import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
  IsMongoId,
  IsArray,
  IsBoolean,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class ProductSearchPayload {
  @ApiProperty({ description: "Search keyword", required: false })
  @IsOptional()
  @IsString({ message: "Từ khóa tìm kiếm phải là chuỗi" })
  @Transform(({ value }) => value?.trim())
  keyword?: string;

  @ApiProperty({ description: "Category ID filter", required: false })
  @IsOptional()
  @IsMongoId({ message: "ID danh mục không hợp lệ" })
  categoryId?: string;

  @ApiProperty({ description: "Subcategory slug filter", required: false })
  @IsOptional()
  @IsString({ message: "Slug danh mục con phải là chuỗi" })
  subcategorySlug?: string;

  @ApiProperty({ description: "Brand ID filter", required: false })
  @IsOptional()
  @IsMongoId({ message: "ID thương hiệu không hợp lệ" })
  brandId?: string;

  @ApiProperty({ description: "Product type filter", required: false })
  @IsOptional()
  @IsString({ message: "Loại sản phẩm phải là chuỗi" })
  productType?: string;

  @ApiProperty({
    description: "Status filter",
    enum: ["active", "inactive", "pending", "out_of_stock", "all"],
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Trạng thái phải là chuỗi" })
  @IsIn(["active", "inactive", "pending", "out_of_stock", "all"], {
    message: "Trạng thái không hợp lệ",
  })
  status?: string;

  @ApiProperty({
    description: "Skin type filter",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Loại da phải là mảng" })
  @IsString({ each: true })
  skinType?: string[];

  @ApiProperty({ description: "Featured filter", required: false })
  @IsOptional()
  @IsBoolean({ message: "Featured phải là boolean" })
  @Transform(({ value }) => value === "true" || value === true)
  featured?: boolean;

  @ApiProperty({ description: "Min price filter", required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Giá tối thiểu phải là số" })
  @Min(0, { message: "Giá tối thiểu phải >= 0" })
  minPrice?: number;

  @ApiProperty({ description: "Max price filter", required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Giá tối đa phải là số" })
  @Min(0, { message: "Giá tối đa phải >= 0" })
  maxPrice?: number;

  @ApiProperty({
    description: "Sort field",
    enum: ["name", "price", "createdAt", "soldCount", "rating"],
    required: false,
    default: "createdAt",
  })
  @IsOptional()
  @IsString({ message: "Trường sắp xếp phải là chuỗi" })
  @IsIn(["name", "price", "createdAt", "soldCount", "rating"], {
    message: "Trường sắp xếp không hợp lệ",
  })
  sortBy?: string = "createdAt";

  @ApiProperty({
    description: "Sort order",
    enum: ["asc", "desc"],
    required: false,
    default: "desc",
  })
  @IsOptional()
  @IsString({ message: "Thứ tự sắp xếp phải là chuỗi" })
  @IsIn(["asc", "desc"], { message: "Thứ tự sắp xếp phải là asc hoặc desc" })
  sortOrder?: "asc" | "desc" = "desc";

  @ApiProperty({
    description: "Page number",
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Số trang phải là số" })
  @Min(1, { message: "Số trang phải lớn hơn 0" })
  page?: number = 1;

  @ApiProperty({
    description: "Items per page",
    minimum: 1,
    maximum: 100,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Số lượng mỗi trang phải là số" })
  @Min(1, { message: "Số lượng mỗi trang phải lớn hơn 0" })
  @Max(100, { message: "Số lượng mỗi trang không được quá 100" })
  limit?: number = 20;
}
