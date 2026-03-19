import {
  Controller, Get, Post, Put, Body, Param,
  HttpCode, HttpStatus, UsePipes, ValidationPipe,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
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

  @Post("play/:configId")
  @HttpCode(HttpStatus.OK)
  async play(
    @Param("configId") configId: string,
  ): Promise<DataResponse<SpinResultDto>> {
    return DataResponse.ok(await this.spinService.spin(configId));
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
