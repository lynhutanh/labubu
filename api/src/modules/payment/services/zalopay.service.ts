import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
  Logger,
} from "@nestjs/common";
import { Model } from "mongoose";
import axios from "axios";
import * as qs from "qs";
import { SettingService } from "src/modules/settings/services/setting.service";
import { TransactionService } from "./transaction.service";
import { WalletService } from "./wallet.service";
import {
  CreateZaloPayOrderPayload,
  ZaloPayCallbackPayload,
  ZaloPayDirectCallbackPayload,
} from "../payloads";
import {
  ZaloPayResponseDto,
  ZaloPayCallbackResponseDto,
  ZaloPayStatusResponseDto,
} from "../dtos";
import {
  IZaloPaySettings,
  IZaloPayRawCallbackData,
  IZaloPayCallbackData,
} from "../interfaces";
import { TRANSACTION_STATUS } from "../constants";
import {
  getVNTimePrefix,
  generateZaloPayMAC,
  generateZaloPayOrderData,
  normalizeZaloPayCallbackData,
  validateZaloPayChecksum,
} from "../helpers";
import { OrderModel } from "src/modules/orders/models";
import { ORDER_PROVIDER, PAYMENT_STATUS } from "src/modules/orders/constants";

@Injectable()
export class ZaloPayService {
  private readonly logger = new Logger(ZaloPayService.name);

  constructor(
    private readonly settingService: SettingService,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @Inject(ORDER_PROVIDER)
    private readonly orderModel: Model<OrderModel>,
  ) {}

  async createOrder(
    payload: CreateZaloPayOrderPayload,
  ): Promise<ZaloPayResponseDto> {
    if (!payload.items || payload.items.length === 0) {
      throw new BadRequestException("Các mục là bắt buộc");
    }

    const settings = (await this.settingService.getKeyValues([
      "zalopayAppId",
      "zalopayKey1",
      "zalopayKey2",
      "zalopayEndpoint",
      "zalopayCallbackUrl",
      "zalopayRedirectUrl",
    ])) as unknown as IZaloPaySettings & { zalopayCallbackUrl?: string };

    // Generate app_trans_id with format: yymmdd_xxxxxx
    const transId = `${getVNTimePrefix()}_${Math.floor(Math.random() * 1000000)}`;
    const appTime = Date.now();

    // Embed data for redirect after payment
    const embeddata = JSON.stringify({
      redirecturl: settings.zalopayRedirectUrl,
    });

    const itemsStr = JSON.stringify(payload.items);

    // Generate MAC: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
    const data = generateZaloPayOrderData(
      settings.zalopayAppId,
      transId,
      payload.appUser,
      payload.amount,
      appTime,
      embeddata,
      itemsStr,
    );
    const mac = generateZaloPayMAC(data, settings.zalopayKey1);

    // ZaloPay v2 API parameters
    const params = {
      app_id: parseInt(settings.zalopayAppId, 10),
      app_user: payload.appUser,
      app_time: appTime,
      amount: payload.amount,
      app_trans_id: transId,
      embed_data: embeddata,
      item: itemsStr,
      description: `Cosmetics - Thanh toán đơn hàng #${transId}`,
      mac,
      bank_code: "",
      callback_url:
        settings.zalopayCallbackUrl ||
        `${settings.zalopayRedirectUrl}/api/payment/zalopay/callback`,
      ...(payload.phone && { phone: payload.phone }),
      ...(payload.email && { email: payload.email }),
    };

    this.logger.log(`Creating ZaloPay order: ${JSON.stringify(params)}`);

    try {
      const response = await axios.post(
        settings.zalopayEndpoint,
        qs.stringify(params),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      this.logger.log(`ZaloPay response: ${JSON.stringify(response.data)}`);

      // Use cashier_order_url for web payment (order_url is for mobile app deep link)
      const zaloPayResponse = new ZaloPayResponseDto({
        returncode: response.data.return_code,
        returnmessage: response.data.return_message,
        orderurl: response.data.cashier_order_url || response.data.order_url,
        zptranstoken: response.data.zp_trans_token || response.data.order_token,
      });
      zaloPayResponse.apptransid = transId;

      return zaloPayResponse;
    } catch (error: any) {
      this.logger.error(
        `ZaloPay error: ${error.response?.data || error.message}`,
      );
      throw new BadRequestException(
        error.response?.data?.return_message ||
          "Không thể tạo đơn hàng ZaloPay",
      );
    }
  }

  public async getListBanks(): Promise<unknown[]> {
    const settings = (await this.settingService.getKeyValues([
      "zalopayAppId",
      "zalopayKey1",
    ])) as unknown as Pick<IZaloPaySettings, "zalopayAppId" | "zalopayKey1">;

    const reqTime = Date.now();
    // MAC for bank list: app_id|reqtime
    const data = `${settings.zalopayAppId}|${reqTime}`;
    const mac = generateZaloPayMAC(data, settings.zalopayKey1);

    const params = {
      appid: parseInt(settings.zalopayAppId, 10),
      reqtime: reqTime,
      mac,
    };

    try {
      const response = await axios.post(
        "https://sb-openapi.zalopay.vn/v2/getlistmerchantbanks",
        qs.stringify(params),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      const banksData = response.data?.banks;
      if (!banksData || !banksData["39"]) {
        return [];
      }

      return banksData["39"];
    } catch (error: any) {
      this.logger.error(`Get banks error: ${error.message}`);
      return [];
    }
  }

  async getStatusByAppTransId(
    apptransid: string,
  ): Promise<ZaloPayStatusResponseDto> {
    const settings = (await this.settingService.getKeyValues([
      "zalopayAppId",
      "zalopayKey1",
    ])) as unknown as Pick<IZaloPaySettings, "zalopayAppId" | "zalopayKey1">;

    // MAC for query: app_id|app_trans_id|key1
    const data = `${settings.zalopayAppId}|${apptransid}|${settings.zalopayKey1}`;
    const mac = generateZaloPayMAC(data, settings.zalopayKey1);

    const params = {
      app_id: parseInt(settings.zalopayAppId, 10),
      app_trans_id: apptransid,
      mac,
    };

    try {
      const response = await axios.post(
        "https://sb-openapi.zalopay.vn/v2/query",
        qs.stringify(params),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );

      return new ZaloPayStatusResponseDto(response.data);
    } catch (error: any) {
      this.logger.error(`Query status error: ${error.message}`);
      return new ZaloPayStatusResponseDto({
        return_code: -1,
        return_message: "Query failed",
      });
    }
  }

  async handlePaymentCallback(
    payload: ZaloPayCallbackPayload | ZaloPayDirectCallbackPayload,
  ): Promise<ZaloPayCallbackResponseDto> {
    try {
      if ("data" in payload && "mac" in payload) {
        const callbackPayload = payload as ZaloPayCallbackPayload;

        const settings = (await this.settingService.getKeyValues([
          "zalopayKey2",
        ])) as unknown as Pick<IZaloPaySettings, "zalopayKey2">;

        const mac = generateZaloPayMAC(
          callbackPayload.data,
          settings.zalopayKey2,
        );

        if (mac !== callbackPayload.mac) {
          return new ZaloPayCallbackResponseDto({
            success: false,
            message: "MAC không hợp lệ",
          });
        }

        const rawData = JSON.parse(
          callbackPayload.data,
        ) as IZaloPayRawCallbackData;
        const callbackData = normalizeZaloPayCallbackData(rawData);
        return await this.processCallbackData(callbackData);
      }

      const directPayload = payload as ZaloPayDirectCallbackPayload;
      const rawData: IZaloPayRawCallbackData = {
        appid: directPayload.appid,
        apptransid: directPayload.apptransid,
        pmcid: directPayload.pmcid,
        bankcode: directPayload.bankcode,
        amount: directPayload.amount,
        discountamount: directPayload.discountamount,
        status: directPayload.status,
        checksum: directPayload.checksum,
      };
      const callbackData = normalizeZaloPayCallbackData(rawData);
      return await this.processCallbackData(callbackData);
    } catch {
      return new ZaloPayCallbackResponseDto({
        success: false,
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async processCallbackData(
    callbackData: IZaloPayCallbackData,
  ): Promise<ZaloPayCallbackResponseDto> {
    try {
      const settings = (await this.settingService.getKeyValues([
        "zalopayKey2",
      ])) as unknown as Pick<IZaloPaySettings, "zalopayKey2">;

      const isValidChecksum = await validateZaloPayChecksum(
        callbackData,
        settings.zalopayKey2,
      );

      if (!isValidChecksum) {
        return new ZaloPayCallbackResponseDto({
          success: false,
          message: "Checksum không hợp lệ",
        });
      }

      if (callbackData.status !== 1) {
        return new ZaloPayCallbackResponseDto({
          success: false,
          message: "Thanh toán thất bại",
        });
      }

      const transaction =
        await this.transactionService.findTransactionByExternalId(
          callbackData.apptransid,
        );

      if (!transaction) {
        return new ZaloPayCallbackResponseDto({
          success: false,
          message: "Không tìm thấy giao dịch",
        });
      }

      await this.transactionService.updateTransaction(
        transaction._id.toString(),
        {
          status: TRANSACTION_STATUS.COMPLETED,
          externalTransactionId: callbackData.apptransid,
          providerData: {
            zalopay: {
              appid: callbackData.appid,
              pmcid: callbackData.pmcid,
              bankcode: callbackData.bankcode,
              amount: callbackData.amount,
              discountamount: callbackData.discountamount,
              status: callbackData.status,
              checksum: callbackData.checksum,
              callbackTime: new Date(),
            },
          },
          notes: "ZaloPay payment completed successfully",
        },
      );

      // Credit the system/admin wallet with the payment amount (VND)
      try {
        const amountVND = transaction.amount || callbackData.amount || 0;
        if (amountVND > 0) {
          await this.walletService.depositToSystemWallet(amountVND, {
            description: `Nhận thanh toán ZaloPay từ đơn hàng: ${transaction.orderNumber || callbackData.apptransid}`,
            referenceId: callbackData.apptransid,
            referenceType: "order", // Use 'order' as it's a valid enum value
          });

          this.logger.log(
            `[ZaloPay] Credited ${amountVND} VND to system wallet for order: ${transaction.orderNumber}`,
          );
        }
      } catch (walletError) {
        // Log but don't fail the callback - transaction is already marked as completed
        this.logger.error(
          `[ZaloPay] Failed to credit system wallet: ${walletError instanceof Error ? walletError.message : "Unknown error"}`,
        );
      }

      // Update order payment status to 'paid'
      try {
        if (transaction.orderId) {
          await this.orderModel.updateOne(
            { _id: transaction.orderId },
            {
              $set: {
                paymentStatus: PAYMENT_STATUS.PAID,
                paidAt: new Date(),
                updatedAt: new Date(),
              },
            },
          );
          this.logger.log(
            `[ZaloPay] Updated order ${transaction.orderId} paymentStatus to 'paid'`,
          );
        } else if (transaction.orderNumber) {
          await this.orderModel.updateOne(
            { orderNumber: transaction.orderNumber },
            {
              $set: {
                paymentStatus: PAYMENT_STATUS.PAID,
                paidAt: new Date(),
                updatedAt: new Date(),
              },
            },
          );
          this.logger.log(
            `[ZaloPay] Updated order ${transaction.orderNumber} paymentStatus to 'paid'`,
          );
        }
      } catch (orderError) {
        this.logger.error(
          `[ZaloPay] Failed to update order status: ${orderError instanceof Error ? orderError.message : "Unknown error"}`,
        );
      }

      return new ZaloPayCallbackResponseDto({
        success: true,
        message: "Thanh toán đã được xử lý thành công",
        transactionId: transaction._id.toString(),
      });
    } catch {
      return new ZaloPayCallbackResponseDto({
        success: false,
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }
}
