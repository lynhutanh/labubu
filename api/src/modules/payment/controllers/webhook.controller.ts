import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SePayService } from "../services";

@ApiTags("Webhooks")
@Controller("webhook")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly sePayService: SePayService) {}

  @Post("sepay")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "SePay webhook endpoint" })
  async sepayWebhook(
    @Body() payload: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[SePay Webhook] Received webhook: ${JSON.stringify(payload)}`);
      const result = await this.sePayService.handleWebhook(payload);
      this.logger.log(`[SePay Webhook] Result: ${JSON.stringify(result)}`);
      return result;
    } catch (error: any) {
      this.logger.error(`[SePay Webhook] Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
