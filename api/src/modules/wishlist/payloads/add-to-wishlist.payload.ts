import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AddToWishlistPayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  productId: string;
}
