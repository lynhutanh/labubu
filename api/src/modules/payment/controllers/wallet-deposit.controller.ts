import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { CurrentUser } from "src/modules/auth/decorators";
import { AuthGuard } from "src/modules/auth/guards";
import { WalletDepositService } from "../services/wallet-deposit.service";
import { DepositPayload } from "../payloads";

@ApiTags("Wallet Deposit")
@Controller("wallet/deposit")
export class WalletDepositController {
  constructor(private readonly walletDepositService: WalletDepositService) {}

  @Post("paypal/create")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tạo đơn nạp tiền qua PayPal" })
  async createPayPalDeposit(
    @CurrentUser() user: any,
    @Body() payload: DepositPayload,
    @Req() req: Request,
  ): Promise<DataResponse<any>> {
    const origin = req.headers.origin || req.headers.referer;
    const frontendBaseUrl = origin
      ? new URL(origin).origin
      : undefined;
    const result = await this.walletDepositService.createPayPalDeposit(
      user,
      payload,
      frontendBaseUrl,
    );
    return DataResponse.ok(result);
  }

  @Get("paypal/capture")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xác nhận thanh toán PayPal và nạp tiền vào ví" })
  async capturePayPalDeposit(
    @Query("token") token: string,
    @Query("PayerID") payerId: string,
  ): Promise<DataResponse<any>> {
    const result = await this.walletDepositService.capturePayPalDeposit(
      token,
      payerId,
    );
    return DataResponse.ok(result);
  }

  @Post("paypal/webhook")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xử lý webhook từ PayPal" })
  async handlePayPalWebhook(
    @Body() webhookEvent: any,
    // @Req() req: any,
  ): Promise<DataResponse<any>> {
    // const headers = {
    //   "paypal-auth-algo": req.headers["paypal-auth-algo"],
    //   "paypal-cert-url": req.headers["paypal-cert-url"],
    //   "paypal-transmission-id": req.headers["paypal-transmission-id"],
    //   "paypal-transmission-sig": req.headers["paypal-transmission-sig"],
    //   "paypal-transmission-time": req.headers["paypal-transmission-time"],
    // };

    const result =
      await this.walletDepositService.handlePayPalWebhook(webhookEvent);
    return DataResponse.ok(result);
  }

  @Post("zalopay/create")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tạo đơn nạp tiền qua ZaloPay" })
  async createZaloPayDeposit(
    @CurrentUser() user: any,
    @Body() payload: DepositPayload,
  ): Promise<DataResponse<any>> {
    const result = await this.walletDepositService.createZaloPayDeposit(
      user,
      payload,
    );
    return DataResponse.ok(result);
  }

  @Post("zalopay/callback")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xử lý callback từ ZaloPay" })
  async handleZaloPayCallback(@Body() body: any): Promise<DataResponse<any>> {
    const result = await this.walletDepositService.handleZaloPayCallback(body);
    return DataResponse.ok(result);
  }

  @Post("sepay/create")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tạo đơn nạp tiền qua chuyển khoản ngân hàng (SePay)" })
  async createSePayDeposit(
    @CurrentUser() user: any,
    @Body() payload: DepositPayload,
  ): Promise<DataResponse<any>> {
    const result = await this.walletDepositService.createSePayDeposit(
      user,
      payload,
    );
    return DataResponse.ok(result);
  }
}
