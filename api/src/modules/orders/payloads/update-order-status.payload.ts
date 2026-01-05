import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
} from "class-validator";
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants";

export class UpdateOrderStatusPayload {
  @ApiProperty({
    description: "New status",
    enum: Object.values(ORDER_STATUS),
  })
  @IsNotEmpty({ message: "Trạng thái là bắt buộc" })
  @IsEnum(Object.values(ORDER_STATUS), { message: "Trạng thái không hợp lệ" })
  status: string;

  @ApiPropertyOptional({
    description: "Cancel reason (required if status is cancelled)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancelReason?: string;
}

export class UpdatePaymentStatusPayload {
  @ApiProperty({
    description: "Payment status",
    enum: Object.values(PAYMENT_STATUS),
  })
  @IsNotEmpty({ message: "Trạng thái thanh toán là bắt buộc" })
  @IsEnum(Object.values(PAYMENT_STATUS), {
    message: "Trạng thái thanh toán không hợp lệ",
  })
  paymentStatus: string;
}
