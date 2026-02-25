import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  HttpCode, HttpStatus, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataResponse } from 'src/kernel';
import { RoleGuard } from 'src/modules/auth/guards';
import { Role } from 'src/modules/auth/decorators';
import { ROLE } from 'src/modules/user/constants';
import { VoucherService } from '../services';
import { VoucherDto, VoucherSearchResponseDto, VoucherStatsDto }from '../dtos';
import {
  CreateVoucherPayload, UpdateVoucherPayload, VoucherSearchPayload, VoucherBulkOperationPayload,
}from '../payloads';

@ApiTags('Admin Vouchers')
@Controller('admin/vouchers')
export class AdminVoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get('search')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(@Query() query: VoucherSearchPayload): Promise<DataResponse<VoucherSearchResponseDto>> {
    const result = await this.voucherService.search(query);
    return DataResponse.ok(result);
  }

  @Get('stats')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getStats(): Promise<DataResponse<VoucherStatsDto>> {
    return DataResponse.ok(await this.voucherService.getStats());
  }

  @Get(':id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<DataResponse<VoucherDto | null>> {
    return DataResponse.ok(await this.voucherService.findById(id));
  }

  @Post()
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() payload: CreateVoucherPayload): Promise<DataResponse<VoucherDto>> {
    return DataResponse.ok(await this.voucherService.create(payload));
  }

  @Put(':id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() payload: UpdateVoucherPayload): Promise<DataResponse<VoucherDto>> {
    return DataResponse.ok(await this.voucherService.update(id, payload));
  }

  @Delete(':id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<DataResponse<{ success: boolean }>> {
    return DataResponse.ok({ success: await this.voucherService.delete(id) });
  }

  @Post('bulk')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkOperation(@Body() payload: VoucherBulkOperationPayload): Promise<DataResponse<{ success: number; failed: number }>> {
    return DataResponse.ok(await this.voucherService.bulkOperation(payload));
  }
}
