import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  HttpCode, HttpStatus, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataResponse } from 'src/kernel';
import { RoleGuard } from 'src/modules/auth/guards';
import { Role } from 'src/modules/auth/decorators';
import { ROLE } from 'src/modules/user/constants';
import { SpinService } from '../services';
import { SpinConfigDto, SpinResultDto, SpinResultSearchResponseDto } from '../dtos';
import {
  CreateSpinConfigPayload, UpdateSpinConfigPayload, SpinResultSearchPayload, UpdateDeliveryStatusPayload,
} from '../payloads';

@ApiTags('Admin Spin')
@Controller('admin/spin')
export class AdminSpinController {
  constructor(private readonly spinService: SpinService) {}

  @Get('configs')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getConfigs(): Promise<DataResponse<SpinConfigDto[]>> {
    return DataResponse.ok(await this.spinService.getConfigs());
  }

  @Get('configs/:id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getConfigById(@Param('id') id: string): Promise<DataResponse<SpinConfigDto | null>> {
    return DataResponse.ok(await this.spinService.getConfigById(id));
  }

  @Post('configs')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createConfig(@Body() payload: CreateSpinConfigPayload): Promise<DataResponse<SpinConfigDto>> {
    return DataResponse.ok(await this.spinService.createConfig(payload));
  }

  @Put('configs/:id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateConfig(@Param('id') id: string, @Body() payload: UpdateSpinConfigPayload): Promise<DataResponse<SpinConfigDto>> {
    return DataResponse.ok(await this.spinService.updateConfig(id, payload));
  }

  @Delete('configs/:id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteConfig(@Param('id') id: string): Promise<DataResponse<{ success: boolean }>> {
    return DataResponse.ok({ success: await this.spinService.deleteConfig(id) });
  }

  @Get('results')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async searchResults(@Query() query: SpinResultSearchPayload): Promise<DataResponse<SpinResultSearchResponseDto>> {
    return DataResponse.ok(await this.spinService.searchResults(query));
  }

  @Put('results/:id/delivery')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body() payload: UpdateDeliveryStatusPayload,
  ): Promise<DataResponse<SpinResultDto>> {
    return DataResponse.ok(await this.spinService.updateDeliveryStatus(id, payload));
  }
}
