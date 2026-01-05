import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min } from "class-validator";

export class UpdateCartItemPayload {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}
