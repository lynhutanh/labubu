import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DepositPayload {
  @ApiProperty({ description: "Số tiền nạp", example: 100000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  amount: number;

  @ApiProperty({ description: "Mô tả", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Phương thức thanh toán", example: "paypal" })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
