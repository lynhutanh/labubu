import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SePayService } from "../services";

@ApiTags("Webhooks")
@Controller("webhook")
export class WebhookController {
  constructor(private readonly sePayService: SePayService) {}

  @Post("sepay")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "SePay webhook endpoint" })
  async sepayWebhook(
    @Body() payload: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.sePayService.handleWebhook(payload);
      return result;
    } catch (error: any) {
      throw error;
    }
  }
}
