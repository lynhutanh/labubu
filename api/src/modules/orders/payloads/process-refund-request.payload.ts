import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, IsEnum } from "class-validator";
import { REFUND_REQUEST_STATUS } from "../constants";

export class ProcessRefundRequestPayload {
  @ApiPropertyOptional({ description: "Ghi chú của admin" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}
