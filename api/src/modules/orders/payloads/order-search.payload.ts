import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class OrderSearchPayload {
  @ApiPropertyOptional({ description: "Search by order number" })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: "Status filter",
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipping",
      "delivered",
      "completed",
      "cancelled",
      "refunded",
    ],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "Payment status filter",
    enum: ["pending", "paid", "failed", "refunded"],
  })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ description: "Sort by field", default: "createdAt" })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";

  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: "Items per page", default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
