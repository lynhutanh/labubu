import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CapturePayPalOrderPayload {
  @ApiProperty({ description: "PayPal Order ID" })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
