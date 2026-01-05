import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { AuthGuard } from "src/modules/auth/guards";
import { ZaloPayService } from "../services";
import {
  ZaloPayResponseDto,
  ZaloPayCallbackResponseDto,
  ZaloPayStatusResponseDto,
} from "../dtos";
import {
  CreateZaloPayOrderPayload,
  ZaloPayCallbackPayload,
  ZaloPayDirectCallbackPayload,
} from "../payloads";

@ApiTags("ZaloPay")
@Controller("payment/zalopay")
export class ZaloPayController {
  constructor(private readonly zaloPayService: ZaloPayService) {}

  @Post("create-order")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Create ZaloPay payment order" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createOrder(
    @Body() payload: CreateZaloPayOrderPayload,
  ): Promise<DataResponse<ZaloPayResponseDto>> {
    const result = await this.zaloPayService.createOrder(payload);
    return DataResponse.ok(result);
  }

  @Get("banks")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get list of supported banks" })
  async getBanks(): Promise<DataResponse<unknown[]>> {
    const banks = await this.zaloPayService.getListBanks();
    return DataResponse.ok(banks);
  }

  @Get("status/:apptransid")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get ZaloPay order status" })
  async getStatus(
    @Param("apptransid") apptransid: string,
  ): Promise<DataResponse<ZaloPayStatusResponseDto>> {
    const status = await this.zaloPayService.getStatusByAppTransId(apptransid);
    return DataResponse.ok(status);
  }

  @Post("callback")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "ZaloPay payment callback" })
  async callback(
    @Body() payload: ZaloPayCallbackPayload | ZaloPayDirectCallbackPayload,
  ): Promise<ZaloPayCallbackResponseDto> {
    return await this.zaloPayService.handlePaymentCallback(payload);
  }
}
