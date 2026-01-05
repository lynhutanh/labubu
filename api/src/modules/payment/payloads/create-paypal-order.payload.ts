import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PayPalOrderItem {
  @ApiProperty({ description: "Item name" })
  name: string;

  @ApiProperty({ description: "Item quantity" })
  quantity: number;

  @ApiProperty({ description: "Unit amount" })
  unitAmount: number;

  @ApiProperty({ description: "Item description", required: false })
  description?: string;
}

export class CreatePayPalOrderPayload {
  @ApiProperty({ description: "Amount" })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: "Currency (VND or USD)", required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: "Payment description", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "Reference ID", required: false })
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiProperty({ description: "Custom ID (Order number)", required: false })
  @IsString()
  @IsOptional()
  customId?: string;

  @ApiProperty({
    description: "Order items",
    type: [PayPalOrderItem],
    required: false,
  })
  @IsOptional()
  items?: PayPalOrderItem[];
}
