import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  MaxLength,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { PAYMENT_METHOD } from "../constants";

export class OrderItemInput {
  @ApiProperty({ description: "Product ID" })
  @IsNotEmpty({ message: "Product ID là bắt buộc" })
  @IsString()
  productId: string;

  @ApiProperty({ description: "Quantity", minimum: 1 })
  @IsNotEmpty({ message: "Số lượng là bắt buộc" })
  @IsNumber()
  @Min(1, { message: "Số lượng phải >= 1" })
  quantity: number;
}

export class ShippingAddressInput {
  @ApiProperty({ description: "Full name" })
  @IsNotEmpty({ message: "Họ tên là bắt buộc" })
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ description: "Phone number" })
  @IsNotEmpty({ message: "Số điện thoại là bắt buộc" })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ description: "Address" })
  @IsNotEmpty({ message: "Địa chỉ là bắt buộc" })
  @IsString()
  @MaxLength(500)
  address: string;

  @ApiPropertyOptional({ description: "Ward" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @ApiPropertyOptional({ description: "District" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ description: "City" })
  @IsNotEmpty({ message: "Thành phố là bắt buộc" })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ description: "Note" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CreateOrderPayload {
  @ApiProperty({ description: "Order items", type: [OrderItemInput] })
  @IsNotEmpty({ message: "Danh sách sản phẩm là bắt buộc" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @ApiProperty({ description: "Shipping address", type: ShippingAddressInput })
  @IsNotEmpty({ message: "Địa chỉ giao hàng là bắt buộc" })
  @ValidateNested()
  @Type(() => ShippingAddressInput)
  shippingAddress: ShippingAddressInput;

  @ApiPropertyOptional({
    description: "Payment method",
    enum: Object.values(PAYMENT_METHOD),
    default: PAYMENT_METHOD.COD,
  })
  @IsOptional()
  @IsEnum(Object.values(PAYMENT_METHOD), {
    message: "Phương thức thanh toán không hợp lệ",
  })
  paymentMethod?: string = PAYMENT_METHOD.COD;
}
