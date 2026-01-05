import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class WithdrawPayload {
  @ApiProperty({ description: "Số tiền rút", example: 100000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  amount: number;

  @ApiProperty({ description: "Mô tả", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Số tài khoản ngân hàng", required: false })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiProperty({ description: "Tên ngân hàng", required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ description: "Tên chủ tài khoản", required: false })
  @IsOptional()
  @IsString()
  accountHolderName?: string;
}
