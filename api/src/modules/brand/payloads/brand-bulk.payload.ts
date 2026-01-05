import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsArray, ArrayNotEmpty, IsIn } from "class-validator";

export class BrandBulkOperationPayload {
  @ApiProperty({
    description: "Hành động thực hiện trên thương hiệu",
    enum: ["activate", "deactivate", "delete"],
  })
  @IsString({ message: "Action phải là chuỗi" })
  @IsIn(["activate", "deactivate", "delete"], {
    message: "Action phải là activate, deactivate hoặc delete",
  })
  action: "activate" | "deactivate" | "delete";

  @ApiProperty({
    description: "Danh sách ID thương hiệu",
    type: [String],
  })
  @IsArray({ message: "brandIds phải là mảng" })
  @ArrayNotEmpty({ message: "brandIds không được rỗng" })
  @IsString({
    each: true,
    message: "Mỗi phần tử trong brandIds phải là chuỗi",
  })
  brandIds: string[];
}
