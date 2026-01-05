import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { AuthGuard } from "src/modules/auth/guards";
import { PayPalService } from "../services";
import { PayPalOrderResponseDto, PayPalCaptureResponseDto } from "../dtos";
import {
  CreatePayPalOrderPayload,
  CapturePayPalOrderPayload,
} from "../payloads";
import {
  IPayPalCaptureOrderResponse,
  IPayPalWebhookEvent,
} from "../interfaces";

@ApiTags("PayPal")
@Controller("payment/paypal")
export class PayPalController {
  constructor(private readonly payPalService: PayPalService) {}

  @Post("create-order")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Create PayPal payment order" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createOrder(
    @Body() payload: CreatePayPalOrderPayload,
  ): Promise<DataResponse<PayPalOrderResponseDto>> {
    const result = await this.payPalService.createOrder(payload);
    return DataResponse.ok(result);
  }

  @Post("capture")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Capture PayPal order" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async captureOrder(
    @Body() payload: CapturePayPalOrderPayload,
  ): Promise<DataResponse<PayPalCaptureResponseDto>> {
    const result = await this.payPalService.captureOrder(payload);
    return DataResponse.ok(result);
  }

  @Get("order/:orderId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get PayPal order details" })
  async getOrder(
    @Param("orderId") orderId: string,
  ): Promise<DataResponse<IPayPalCaptureOrderResponse>> {
    const order = await this.payPalService.getOrder(orderId);
    return DataResponse.ok(order);
  }

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "PayPal webhook handler" })
  async handleWebhook(
    @Body() webhookEvent: IPayPalWebhookEvent,
    @Headers() headers: Record<string, string>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.payPalService.handleWebhook(
        webhookEvent,
        headers,
      );
      return result;
    } catch (error) {
      // Always return 200 to PayPal to acknowledge receipt
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
