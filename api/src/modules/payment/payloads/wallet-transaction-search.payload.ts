import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsDateString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class WalletTransactionSearchPayload {
  @ApiProperty({ description: "Loại giao dịch", required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: "Trạng thái", required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: "Ngày bắt đầu", required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: "Ngày kết thúc", required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: "Số lượng kết quả", default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ description: "Vị trí bắt đầu", default: 0 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({ description: "Sắp xếp", required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: "Thứ tự sắp xếp", required: false })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}
