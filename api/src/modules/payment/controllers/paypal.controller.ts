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
  Req,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Request } from "express";
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
  private readonly logger = new Logger(PayPalController.name);

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
    @Req() req: Request,
    @Headers() headers: Record<string, string>,
  ): Promise<{ success: boolean; message: string }> {
    let webhookEvent: IPayPalWebhookEvent;
    
    // Parse body from Buffer (bodyParser.raw returns Buffer)
    if (Buffer.isBuffer(req.body)) {
      this.logger.log(`[PayPal Webhook] Raw body (Buffer) length: ${req.body.length}`);
      try {
        const bodyStr = req.body.toString("utf8");
        webhookEvent = JSON.parse(bodyStr);
        this.logger.log(`[PayPal Webhook] Successfully parsed body - event_type: ${webhookEvent.event_type || "unknown"}`);
      } catch (e) {
        this.logger.error(`[PayPal Webhook] Cannot parse raw body: ${e instanceof Error ? e.message : "unknown"}`);
        return {
          success: false,
          message: `Invalid webhook body: ${e instanceof Error ? e.message : "unknown"}`,
        };
      }
    } else if (req.body && typeof req.body === "object") {
      // Fallback: body already parsed by NestJS
      webhookEvent = req.body as IPayPalWebhookEvent;
      this.logger.log(`[PayPal Webhook] Body already parsed - event_type: ${webhookEvent.event_type || "unknown"}`);
    } else {
      this.logger.error(`[PayPal Webhook] No body found in request`);
      return {
        success: false,
        message: "No webhook body received",
      };
    }
    this.logger.log("===========================================");
    this.logger.log("[PayPal Webhook] ===== WEBHOOK RECEIVED =====");
    this.logger.log(`[PayPal Webhook] Event Type: ${webhookEvent?.event_type || "unknown"}`);
    this.logger.log(`[PayPal Webhook] Event ID: ${webhookEvent?.id || "unknown"}`);
    this.logger.log(`[PayPal Webhook] Resource Type: ${webhookEvent?.resource_type || "unknown"}`);
    this.logger.log(`[PayPal Webhook] Create Time: ${webhookEvent?.create_time || "unknown"}`);
    this.logger.log(`[PayPal Webhook] Headers received: ${Object.keys(headers).join(", ")}`);
    
    if (webhookEvent?.resource) {
      this.logger.log(`[PayPal Webhook] Resource ID: ${webhookEvent.resource.id || "unknown"}`);
      this.logger.log(`[PayPal Webhook] Resource Status: ${webhookEvent.resource.status || "unknown"}`);
      if (webhookEvent.resource.amount) {
        this.logger.log(`[PayPal Webhook] Amount: ${webhookEvent.resource.amount.value || "unknown"} ${webhookEvent.resource.amount.currency_code || "unknown"}`);
      }
      if (webhookEvent.resource.custom_id) {
        this.logger.log(`[PayPal Webhook] Custom ID (Order Number): ${webhookEvent.resource.custom_id}`);
      }
      if (webhookEvent.resource.supplementary_data?.related_ids) {
        this.logger.log(`[PayPal Webhook] Related Order ID: ${webhookEvent.resource.supplementary_data.related_ids.order_id || "unknown"}`);
      }
    }
    
    this.logger.log(`[PayPal Webhook] Full Event JSON: ${JSON.stringify(webhookEvent, null, 2)}`);
    this.logger.log("===========================================");
    
    try {
      const result = await this.payPalService.handleWebhook(
        webhookEvent,
        headers,
      );
      
      this.logger.log(`[PayPal Webhook] ===== PROCESSING RESULT =====`);
      this.logger.log(`[PayPal Webhook] Success: ${result.success}`);
      this.logger.log(`[PayPal Webhook] Message: ${result.message}`);
      this.logger.log("===========================================");
      
      return result;
    } catch (error) {
      this.logger.error(`[PayPal Webhook] ===== ERROR =====`);
      this.logger.error(`[PayPal Webhook] Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      this.logger.error(`[PayPal Webhook] Stack: ${error instanceof Error ? error.stack : "N/A"}`);
      this.logger.error("===========================================");
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
