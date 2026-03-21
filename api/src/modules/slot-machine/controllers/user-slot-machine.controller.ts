import {
  Controller, Get, Post, Put, Body, Param,
  HttpCode, HttpStatus, UsePipes, ValidationPipe, UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { AuthGuard } from "src/modules/auth/guards";
import { CurrentUser } from "src/modules/auth/decorators";
import { SlotMachineService } from "../services";
import { SlotMachineConfigDto, SlotMachineResultDto } from "../dtos";
import { SubmitSlotMachineInfoPayload } from "../payloads";

@ApiTags("Slot Machine")
@Controller("slot-machine")
export class UserSlotMachineController {
  constructor(private readonly slotMachineService: SlotMachineService) {}

  @Get("active")
  @HttpCode(HttpStatus.OK)
  async getActiveConfig(): Promise<DataResponse<SlotMachineConfigDto | null>> {
    return DataResponse.ok(await this.slotMachineService.getActiveConfig());
  }

  @Get("turns/:configId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSlotTurns(
    @CurrentUser() user: any,
    @Param("configId") configId: string,
  ): Promise<DataResponse<any>> {
    return DataResponse.ok(await this.slotMachineService.getSlotTurns(user._id, configId));
  }

  @Post("play/:configId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async play(
    @CurrentUser() user: any,
    @Param("configId") configId: string,
  ): Promise<DataResponse<SlotMachineResultDto>> {
    return DataResponse.ok(await this.slotMachineService.play(configId, user._id));
  }

  @Put("results/:id/info")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async submitInfo(
    @Param("id") id: string,
    @Body() payload: SubmitSlotMachineInfoPayload,
  ): Promise<DataResponse<SlotMachineResultDto>> {
    return DataResponse.ok(await this.slotMachineService.submitInfo(id, payload));
  }

  @Post("results/by-ids")
  @HttpCode(HttpStatus.OK)
  async getResultsByIds(
    @Body("ids") ids: string[],
  ): Promise<DataResponse<SlotMachineResultDto[]>> {
    return DataResponse.ok(await this.slotMachineService.getResultsByIds(ids || []));
  }

  @Get("my-results")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyResults(
    @CurrentUser() user: any,
  ): Promise<DataResponse<SlotMachineResultDto[]>> {
    return DataResponse.ok(await this.slotMachineService.getResultsByUser(user._id));
  }
}
