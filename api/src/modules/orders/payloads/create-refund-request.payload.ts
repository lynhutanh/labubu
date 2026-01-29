import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateRefundRequestPayload {
  @ApiProperty({ description: "Order ID" })
  @IsNotEmpty({ message: "Order ID là bắt buộc" })
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ description: "Lý do hoàn tiền" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
