import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsArray, IsIn, IsMongoId } from "class-validator";

export class ProductBulkOperationPayload {
  @ApiProperty({
    description: "Bulk action",
    enum: ["activate", "deactivate", "delete"],
  })
  @IsNotEmpty({ message: "Action là bắt buộc" })
  @IsIn(["activate", "deactivate", "delete"], {
    message: "Action phải là activate, deactivate hoặc delete",
  })
  action: "activate" | "deactivate" | "delete";

  @ApiProperty({ description: "Product IDs", type: [String] })
  @IsNotEmpty({ message: "Danh sách ID sản phẩm là bắt buộc" })
  @IsArray({ message: "productIds phải là mảng" })
  @IsMongoId({ each: true, message: "ID sản phẩm không hợp lệ" })
  productIds: string[];
}
