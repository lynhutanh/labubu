import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  HttpCode, HttpStatus, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataResponse } from 'src/kernel';
import { RoleGuard } from 'src/modules/auth/guards';
import { Role } from 'src/modules/auth/decorators';
import { ROLE } from 'src/modules/user/constants';
import { SlotMachineService } from '../services';
import { SlotMachineConfigDto, SlotMachineResultDto, SlotMachineResultSearchResponseDto } from '../dtos';
import {
  CreateSlotMachineConfigPayload, UpdateSlotMachineConfigPayload,
  SlotMachineResultSearchPayload, UpdateSlotMachineDeliveryStatusPayload,
} from '../payloads';

@ApiTags('Admin Slot Machine')
@Controller('admin/slot-machine')
export class AdminSlotMachineController {
  constructor(private readonly slotMachineService: SlotMachineService) {}

  @Get('configs')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getConfigs(): Promise<DataResponse<SlotMachineConfigDto[]>> {
    return DataResponse.ok(await this.slotMachineService.getConfigs());
  }

  @Get('configs/:id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getConfigById(@Param('id') id: string): Promise<DataResponse<SlotMachineConfigDto | null>> {
    return DataResponse.ok(await this.slotMachineService.getConfigById(id));
  }

  @Post('configs')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createConfig(@Body() payload: CreateSlotMachineConfigPayload): Promise<DataResponse<SlotMachineConfigDto>> {
    return DataResponse.ok(await this.slotMachineService.createConfig(payload));
  }

  @Put('configs/:id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateConfig(@Param('id') id: string, @Body() payload: UpdateSlotMachineConfigPayload): Promise<DataResponse<SlotMachineConfigDto>> {
    return DataResponse.ok(await this.slotMachineService.updateConfig(id, payload));
  }

  @Delete('configs/:id')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteConfig(@Param('id') id: string): Promise<DataResponse<{ success: boolean }>> {
    return DataResponse.ok({ success: await this.slotMachineService.deleteConfig(id) });
  }

  @Get('results')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async searchResults(@Query() query: SlotMachineResultSearchPayload): Promise<DataResponse<SlotMachineResultSearchResponseDto>> {
    return DataResponse.ok(await this.slotMachineService.searchResults(query));
  }

  @Put('results/:id/delivery')
  @UseGuards(RoleGuard) @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body() payload: UpdateSlotMachineDeliveryStatusPayload,
  ): Promise<DataResponse<SlotMachineResultDto>> {
    return DataResponse.ok(await this.slotMachineService.updateDeliveryStatus(id, payload));
  }
}
