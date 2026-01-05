import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class CategorySearchPayload {
  @ApiProperty({ description: "Search keyword", required: false })
  @IsOptional()
  @IsString({ message: "Từ khóa tìm kiếm phải là chuỗi" })
  @Transform(({ value }) => value?.trim())
  keyword?: string;

  @ApiProperty({
    description: "Category status filter",
    enum: ["active", "inactive", "all"],
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Trạng thái phải là chuỗi" })
  @IsIn(["active", "inactive", "all"], {
    message: "Trạng thái phải là active, inactive hoặc all",
  })
  status?: "active" | "inactive" | "all";

  @ApiProperty({
    description: "Sort field",
    enum: ["name", "createdAt", "sortOrder"],
    required: false,
    default: "sortOrder",
  })
  @IsOptional()
  @IsString({ message: "Trường sắp xếp phải là chuỗi" })
  @IsIn(["name", "createdAt", "sortOrder"], {
    message: "Trường sắp xếp phải là name, createdAt hoặc sortOrder",
  })
  sortBy?: "name" | "createdAt" | "sortOrder" = "sortOrder";

  @ApiProperty({
    description: "Sort order",
    enum: ["asc", "desc"],
    required: false,
    default: "asc",
  })
  @IsOptional()
  @IsString({ message: "Thứ tự sắp xếp phải là chuỗi" })
  @IsIn(["asc", "desc"], { message: "Thứ tự sắp xếp phải là asc hoặc desc" })
  sortOrder?: "asc" | "desc" = "asc";

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
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Số lượng mỗi trang phải là số" })
  @Min(1, { message: "Số lượng mỗi trang phải lớn hơn 0" })
  @Max(100, { message: "Số lượng mỗi trang không được quá 100" })
  limit?: number = 10;
}
