import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CancelOrderPayload {
  @ApiPropertyOptional({ description: "Cancel reason" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
