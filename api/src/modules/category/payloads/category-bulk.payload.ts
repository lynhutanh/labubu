import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsIn,
} from "class-validator";

export class CategoryBulkOperationPayload {
  @ApiProperty({
    description: "Hành động thực hiện trên danh mục",
    enum: ["activate", "deactivate", "delete"],
  })
  @IsString({ message: "Action phải là chuỗi" })
  @IsIn(["activate", "deactivate", "delete"], {
    message: "Action phải là activate, deactivate hoặc delete",
  })
  action: "activate" | "deactivate" | "delete";

  @ApiProperty({
    description: "Danh sách ID danh mục",
    type: [String],
  })
  @IsArray({ message: "categoryIds phải là mảng" })
  @ArrayNotEmpty({ message: "categoryIds không được rỗng" })
  @IsString({
    each: true,
    message: "Mỗi phần tử trong categoryIds phải là chuỗi",
  })
  categoryIds: string[];

  @ApiProperty({
    description: "ID danh mục cha đích (dùng khi action là move)",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "targetParentId phải là chuỗi" })
  targetParentId?: string;
}
