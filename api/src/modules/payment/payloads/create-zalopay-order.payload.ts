import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ZaloPayItem {
  @ApiProperty({ description: "Item ID" })
  @IsString()
  @IsNotEmpty()
  itemid: string;

  @ApiProperty({ description: "Item name" })
  @IsString()
  @IsNotEmpty()
  itemname: string;

  @ApiProperty({ description: "Item price" })
  @IsNumber()
  @IsNotEmpty()
  itemprice: number;

  @ApiProperty({ description: "Item quantity" })
  @IsNumber()
  @IsNotEmpty()
  itemquantity: number;
}

export class CreateZaloPayOrderPayload {
  @ApiProperty({ description: "Amount in VND" })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: "App user identifier" })
  @IsString()
  @IsNotEmpty()
  appUser: string;

  @ApiProperty({
    description: "Order items",
    type: [ZaloPayItem],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZaloPayItem)
  @IsOptional()
  items?: ZaloPayItem[];

  @ApiProperty({ description: "Phone number", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: "Email", required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: "Address", required: false })
  @IsString()
  @IsOptional()
  address?: string;
}
