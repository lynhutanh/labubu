import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class AddToCartPayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ default: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number = 1;
}
