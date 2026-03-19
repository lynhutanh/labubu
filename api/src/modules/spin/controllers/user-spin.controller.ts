import {
  Controller, Get, Post, Put, Body, Param,
  HttpCode, HttpStatus, UsePipes, ValidationPipe, UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { AuthGuard } from "src/modules/auth/guards";
import { CurrentUser } from "src/modules/auth/decorators";
import { SpinService } from "../services";
import { SpinConfigDto, SpinResultDto } from "../dtos";
import { SubmitSpinInfoPayload } from "../payloads";

@ApiTags("Spin")
@Controller("spin")
export class UserSpinController {
  constructor(private readonly spinService: SpinService) {}

  @Get("active")
  @HttpCode(HttpStatus.OK)
  async getActiveConfig(): Promise<DataResponse<SpinConfigDto | null>> {
    return DataResponse.ok(await this.spinService.getActiveConfig());
  }

  @Get("turns/:configId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSpinTurns(
    @CurrentUser() user: any,
    @Param("configId") configId: string,
  ): Promise<DataResponse<any>> {
    return DataResponse.ok(await this.spinService.getSpinTurns(user._id, configId));
  }

  @Post("play/:configId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async play(
    @CurrentUser() user: any,
    @Param("configId") configId: string,
  ): Promise<DataResponse<SpinResultDto>> {
    return DataResponse.ok(await this.spinService.spin(configId, user._id));
  }

  @Put("results/:id/info")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async submitInfo(
    @Param("id") id: string,
    @Body() payload: SubmitSpinInfoPayload,
  ): Promise<DataResponse<SpinResultDto>> {
    return DataResponse.ok(await this.spinService.submitInfo(id, payload));
  }

  @Post("results/by-ids")
  @HttpCode(HttpStatus.OK)
  async getResultsByIds(
    @Body("ids") ids: string[],
  ): Promise<DataResponse<SpinResultDto[]>> {
    return DataResponse.ok(await this.spinService.getResultsByIds(ids || []));
  }
}
