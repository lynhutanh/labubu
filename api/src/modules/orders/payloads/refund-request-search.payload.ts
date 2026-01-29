import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, Min, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { REFUND_REQUEST_STATUS } from "../constants";

export class RefundRequestSearchPayload {
  @ApiPropertyOptional({ description: "Status", enum: Object.values(REFUND_REQUEST_STATUS) })
  @IsOptional()
  @IsEnum(Object.values(REFUND_REQUEST_STATUS))
  status?: string;

  @ApiPropertyOptional({ description: "Page number", minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", minimum: 1, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: "Sort by", default: "createdAt" })
  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({ description: "Sort order", enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc";
}
