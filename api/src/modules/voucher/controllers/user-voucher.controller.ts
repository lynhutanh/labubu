import {
  Controller, Get, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { DataResponse }from 'src/kernel';
import { AuthGuard } from 'src/modules/auth/guards';
import { VoucherService } from '../services';

class UserVoucherQueryDto {
  @IsOptional() @IsNumber() @Type(() => Number)
  orderAmount?: number;

  @IsOptional() @IsNumber() @Type(() => Number)
  page?: number = 1;

  @IsOptional() @IsNumber() @Type(() => Number)
  limit?: number = 50;
}

class ValidateVoucherQueryDto {
  @IsString()
  code: string;

  @IsNumber() @Type(() => Number)
  orderAmount: number;
}

@ApiTags('Vouchers')
@Controller('vouchers')
export class UserVoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active vouchers for user' })
  async getActiveVouchers(@Query() query: UserVoucherQueryDto) {
    const now = new Date();
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const [vouchers, total] = await Promise.all([
      (this.voucherService as any).voucherModel
        .find({ status: 'active', startDate: { $lte: now }, endDate: { $gte: now } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (this.voucherService as any).voucherModel.countDocuments({
        status: 'active', startDate: { $lte: now }, endDate: { $gte: now },
      }),
    ]);

    return DataResponse.ok({ vouchers, total, page, limit });
  }

  @Get('validate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a voucher code' })
  async validateVoucher(@Query() query: ValidateVoucherQueryDto) {
    const result = await this.voucherService.validateVoucher(
      query.code,
      query.orderAmount,
    );
    return DataResponse.ok(result);
  }
}
