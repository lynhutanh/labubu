import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SePayService, ISePayWebhookPayload } from "../services";

@ApiTags("SePay")
@Controller("payment/sepay")
export class SePayController {
  constructor(private readonly sePayService: SePayService) {}

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "SePay webhook endpoint" })
  async webhook(
    @Body() payload: ISePayWebhookPayload,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.sePayService.handleWebhook(payload);
    return result;
  }
}
