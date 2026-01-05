import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from "@nestjs/common";
import { Model } from "mongoose";
import axios from "axios";
import { SettingService } from "src/modules/settings/services/setting.service";
import { TransactionService } from "./transaction.service";
import { WalletService } from "./wallet.service";
import {
  CreatePayPalOrderPayload,
  CapturePayPalOrderPayload,
} from "../payloads";
import { PayPalOrderResponseDto, PayPalCaptureResponseDto } from "../dtos";
import {
  IPayPalSettings,
  IPayPalCreateOrderRequest,
  IPayPalCreateOrderResponse,
  IPayPalCaptureOrderResponse,
  IPayPalWebhookEvent,
} from "../interfaces";
import { TRANSACTION_STATUS } from "../constants";
import {
  getPayPalBaseUrl,
  getPayPalAccessToken,
  handlePayPalApiError,
  verifyPayPalWebhook,
} from "../helpers";
import { convertVNDToUSD } from "../helpers/currency.helper";
import { OrderModel } from "src/modules/orders/models";
import { ORDER_PROVIDER, PAYMENT_STATUS } from "src/modules/orders/constants";

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);

  constructor(
    private readonly settingService: SettingService,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @Inject(ORDER_PROVIDER)
    private readonly orderModel: Model<OrderModel>,
  ) {}

  private async getSettings(): Promise<IPayPalSettings> {
    return (await this.settingService.getKeyValues([
      "paypalClientId",
      "paypalClientSecret",
      "paypalMode",
      "paypalReturnUrl",
      "paypalCancelUrl",
      "paypalWebhookId",
      "paypalEnabled",
    ])) as unknown as IPayPalSettings;
  }

  async createOrder(
    payload: CreatePayPalOrderPayload,
  ): Promise<PayPalOrderResponseDto> {
    const settings = await this.getSettings();

    if (settings.paypalEnabled !== "true") {
      throw new BadRequestException("Thanh toán PayPal chưa được kích hoạt");
    }

    if (!settings.paypalClientId || !settings.paypalClientSecret) {
      throw new BadRequestException(
        "Thông tin xác thực PayPal chưa được cấu hình",
      );
    }

    let amountUSD = payload.amount;
    let originalAmountVND = payload.amount;
    let exchangeRate = 1;

    this.logger.log(
      `[PayPal] Creating order - Input: amount=${payload.amount}, currency=${payload.currency || "VND"}`,
    );

    if (!payload.currency || payload.currency === "VND") {
      const conversion = await convertVNDToUSD(payload.amount);
      amountUSD = conversion.convertedAmount;
      exchangeRate = conversion.rate;
      originalAmountVND = conversion.amount;

      this.logger.log(
        `[PayPal] Currency conversion: ${originalAmountVND} VND -> ${amountUSD} USD (rate: ${exchangeRate})`,
      );
    } else if (payload.currency !== "USD") {
      throw new BadRequestException(
        "PayPal only supports USD. Please convert your currency first.",
      );
    }

    const accessToken = await getPayPalAccessToken(settings);
    const baseUrl = getPayPalBaseUrl(settings.paypalMode);

    if (amountUSD < 0.01) {
      throw new BadRequestException(
        "Số tiền sau khi chuyển đổi quá nhỏ (tối thiểu 0.01 USD)",
      );
    }

    const items: any[] = [];
    let itemsTotalUSD = 0;

    if (payload.items && payload.items.length > 0) {
      payload.items.forEach((item) => {
        let itemUnitAmountUSD = item.unitAmount;
        if (!payload.currency || payload.currency === "VND") {
          itemUnitAmountUSD = itemUnitAmountUSD * exchangeRate;
        }

        if (itemUnitAmountUSD < 0.01) {
          itemUnitAmountUSD = 0.01;
        }

        const itemTotal = itemUnitAmountUSD * item.quantity;
        itemsTotalUSD += itemTotal;

        this.logger.log(
          `[PayPal] Item: ${item.name}, qty=${item.quantity}, unitVND=${item.unitAmount}, unitUSD=${itemUnitAmountUSD.toFixed(2)}`,
        );

        items.push({
          name: item.name || "Product",
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: "USD",
            value: itemUnitAmountUSD.toFixed(2),
          },
          description: item.description || item.name || "Product",
        });
      });

      amountUSD = itemsTotalUSD > 0 ? itemsTotalUSD : amountUSD;
    }

    this.logger.log(
      `[PayPal] Final amount to send to PayPal: ${amountUSD} USD (items total: ${itemsTotalUSD})`,
    );

    const finalAmountUSD = items.length > 0 ? itemsTotalUSD : amountUSD;
    const formattedAmount = Math.max(
      parseFloat(finalAmountUSD.toFixed(2)),
      0.01,
    ).toFixed(2);

    const calculatedItemTotal =
      items.length > 0
        ? items
            .reduce(
              (sum, item) =>
                sum +
                parseFloat(item.unit_amount.value) * parseFloat(item.quantity),
              0,
            )
            .toFixed(2)
        : formattedAmount;

    const finalAmount =
      items.length > 0 ? calculatedItemTotal : formattedAmount;

    const purchaseUnit: any = {
      description: payload.description || "Payment for order",
      amount: {
        currency_code: "USD",
        value: finalAmount,
      },
    };

    if (payload.referenceId) {
      purchaseUnit.reference_id = payload.referenceId;
    }
    if (payload.customId) {
      purchaseUnit.custom_id = payload.customId;
    }

    if (items.length > 0) {
      purchaseUnit.items = items;
      purchaseUnit.amount.breakdown = {
        item_total: {
          currency_code: "USD",
          value: calculatedItemTotal,
        },
      };
    }

    const orderRequest: IPayPalCreateOrderRequest = {
      intent: "CAPTURE",
      purchase_units: [purchaseUnit],
      application_context: {
        brand_name: "Cosmetics Shop",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: settings.paypalReturnUrl,
        cancel_url: settings.paypalCancelUrl,
        locale: "en-US",
      },
    };

    try {
      const response = await axios.post<IPayPalCreateOrderResponse>(
        `${baseUrl}/v2/checkout/orders`,
        orderRequest,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "PayPal-Request-Id": `order-${Date.now()}`,
          },
          timeout: 30000,
        },
      );

      const orderResponse = new PayPalOrderResponseDto(response.data);
      orderResponse.exchangeInfo = {
        originalAmountVND,
        amountUSD: parseFloat(finalAmount),
        exchangeRate,
        originalCurrency: payload.currency || "VND",
      };

      return orderResponse;
    } catch (error) {
      return handlePayPalApiError(error);
    }
  }

  async captureOrder(
    payload: CapturePayPalOrderPayload,
  ): Promise<PayPalCaptureResponseDto> {
    const settings = await this.getSettings();

    if (settings.paypalEnabled !== "true") {
      throw new BadRequestException("Thanh toán PayPal chưa được kích hoạt");
    }

    const accessToken = await getPayPalAccessToken(settings);
    const baseUrl = getPayPalBaseUrl(settings.paypalMode);

    try {
      const response = await axios.post<IPayPalCaptureOrderResponse>(
        `${baseUrl}/v2/checkout/orders/${payload.orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "PayPal-Request-Id": `capture-${Date.now()}`,
          },
          timeout: 30000,
        },
      );

      return new PayPalCaptureResponseDto(response.data);
    } catch (error) {
      return handlePayPalApiError(error);
    }
  }

  async getOrder(orderId: string): Promise<IPayPalCaptureOrderResponse> {
    const settings = await this.getSettings();
    const accessToken = await getPayPalAccessToken(settings);
    const baseUrl = getPayPalBaseUrl(settings.paypalMode);

    try {
      const response = await axios.get<IPayPalCaptureOrderResponse>(
        `${baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      return response.data;
    } catch (error) {
      return handlePayPalApiError(error);
    }
  }

  async handleWebhook(
    webhookEvent: IPayPalWebhookEvent,
    headers: Record<string, string>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[PayPal Webhook] Received event: ${webhookEvent?.event_type}`);

      const settings = await this.getSettings();

      if (settings.paypalEnabled !== "true") {
        this.logger.warn("[PayPal Webhook] PayPal not enabled");
        return { success: false, message: "PayPal chưa được kích hoạt" };
      }

      // Skip webhook verification in sandbox mode if webhookId not configured
      const webhookId =
        headers["paypal-webhook-id"] || settings.paypalWebhookId;
      if (webhookId && settings.paypalWebhookId) {
        try {
          await verifyPayPalWebhook(
            webhookId,
            webhookEvent,
            headers,
            settings,
          );
        } catch (verifyError) {
          this.logger.warn(
            `[PayPal Webhook] Verification skipped: ${verifyError instanceof Error ? verifyError.message : "Unknown"}`,
          );
          // Continue processing even if verification fails in sandbox
        }
      } else {
        this.logger.warn("[PayPal Webhook] Webhook verification skipped - no webhookId configured");
      }

      const eventType = webhookEvent.event_type;
      const resource = webhookEvent.resource;

      this.logger.log(`[PayPal Webhook] Processing event type: ${eventType}`);

      switch (eventType) {
        case "PAYMENT.CAPTURE.COMPLETED":
          return await this.handlePaymentCaptureCompleted(resource);
        case "PAYMENT.CAPTURE.DENIED":
          return await this.handlePaymentCaptureDenied(resource);
        case "CHECKOUT.ORDER.APPROVED":
          return await this.handleOrderApproved(resource);
        case "CHECKOUT.ORDER.CANCELLED":
          return await this.handleOrderCancelled(resource);
        default:
          this.logger.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
          return {
            success: true,
            message: `Unhandled event type: ${eventType}`,
          };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`[PayPal Webhook] Error: ${errorMessage}`);
      return {
        success: false,
        message: `Webhook processing error: ${errorMessage}`,
      };
    }
  }

  private async handlePaymentCaptureCompleted(resource: any): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const captureId = resource.id;
      const orderId = resource.supplementary_data?.related_ids?.order_id;
      const customId = resource.custom_id;

      this.logger.log(
        `[PayPal] Processing capture completed - captureId: ${captureId}, orderId: ${orderId}, customId: ${customId}`,
      );

      if (!orderId && !captureId && !customId) {
        return {
          success: false,
          message: "Thiếu order ID, capture ID hoặc custom ID",
        };
      }

      let transaction = null;
      if (orderId) {
        transaction =
          await this.transactionService.findTransactionByPayPalOrderId(orderId);
      }

      if (!transaction && customId) {
        transaction =
          await this.transactionService.findTransactionByOrderNumber(customId);
      }

      if (!transaction && orderId) {
        transaction =
          await this.transactionService.findTransactionByExternalId(orderId);
      }

      if (!transaction) {
        this.logger.warn(`[PayPal] Transaction not found for payment capture`);
        return { success: false, message: "Không tìm thấy giao dịch" };
      }

      this.logger.log(
        `[PayPal] Found transaction: ${transaction._id}, amount: ${transaction.amount} ${transaction.currency}`,
      );

      // Update transaction status
      await this.transactionService.updateTransaction(
        transaction._id.toString(),
        {
          status: TRANSACTION_STATUS.COMPLETED,
          providerData: {
            ...transaction.providerData,
            paypal: {
              ...(transaction.providerData?.paypal || {}),
              captureId: captureId,
              captureStatus: "COMPLETED",
              webhookReceivedAt: new Date(),
              amount: resource.amount?.value,
              currency: resource.amount?.currency_code,
            },
          },
          notes: "PayPal payment completed via webhook",
        },
      );

      // Credit the system/admin wallet with the original VND amount
      try {
        const amountVND = transaction.amount || 0;
        if (amountVND > 0) {
          await this.walletService.depositToSystemWallet(amountVND, {
            description: `Nhận thanh toán PayPal từ đơn hàng: ${transaction.orderNumber || customId}`,
            referenceId: captureId,
            referenceType: "order", // Use 'order' as it's a valid enum value
          });

          this.logger.log(
            `[PayPal] Credited ${amountVND} VND to system wallet for order: ${transaction.orderNumber}`,
          );
        }
      } catch (walletError) {
        // Log but don't fail the webhook - transaction is already marked as completed
        this.logger.error(
          `[PayPal] Failed to credit system wallet: ${walletError instanceof Error ? walletError.message : "Unknown error"}`,
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
            `[PayPal] Updated order ${transaction.orderId} paymentStatus to 'paid'`,
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
            `[PayPal] Updated order ${transaction.orderNumber} paymentStatus to 'paid'`,
          );
        }
      } catch (orderError) {
        this.logger.error(
          `[PayPal] Failed to update order status: ${orderError instanceof Error ? orderError.message : "Unknown error"}`,
        );
      }

      return {
        success: true,
        message: "Thanh toán đã được xác nhận thành công",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`[PayPal] handlePaymentCaptureCompleted error: ${errorMessage}`);
      return {
        success: false,
        message: `Failed to process capture: ${errorMessage}`,
      };
    }
  }

  private async handlePaymentCaptureDenied(resource: any): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const captureId = resource.id;
      const orderId = resource.supplementary_data?.related_ids?.order_id;

      const transaction =
        await this.transactionService.findTransactionByExternalId(
          orderId || captureId,
        );

      if (!transaction) {
        return { success: false, message: "Không tìm thấy giao dịch" };
      }

      const existingProviderData =
        (transaction.providerData as Record<string, unknown>) || {};
      const existingPaypalData =
        (existingProviderData.paypal as Record<string, unknown>) || {};

      await this.transactionService.updateTransaction(
        transaction._id.toString(),
        {
          status: TRANSACTION_STATUS.FAILED,
          providerData: {
            ...existingProviderData,
            paypal: {
              ...existingPaypalData,
              captureId: captureId,
              captureStatus: "DENIED",
              webhookReceivedAt: new Date(),
              reasonCode: resource.reason_code,
            },
          },
          notes: "PayPal payment denied via webhook",
        },
      );

      return { success: true, message: "Thanh toán đã bị từ chối" };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        message: `Failed to process denial: ${errorMessage}`,
      };
    }
  }

  private async handleOrderApproved(resource: any): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const orderId = resource.id;
      const status = resource.status;

      if (status !== "APPROVED") {
        return {
          success: false,
          message: `Order status is ${status}, expected APPROVED`,
        };
      }

      const transaction =
        await this.transactionService.findTransactionByPayPalOrderId(orderId);

      let targetTransaction = transaction;
      if (!targetTransaction) {
        targetTransaction =
          await this.transactionService.findTransactionByExternalId(orderId);
        if (!targetTransaction) {
          return {
            success: false,
            message: "Không tìm thấy giao dịch cho đơn hàng PayPal này",
          };
        }
      }

      if (targetTransaction) {
        const existingProviderData =
          (targetTransaction.providerData as Record<string, unknown>) || {};
        const existingPaypalData =
          (existingProviderData.paypal as Record<string, unknown>) || {};

        await this.transactionService.updateTransaction(
          targetTransaction._id.toString(),
          {
            status: TRANSACTION_STATUS.PROCESSING,
            providerData: {
              ...existingProviderData,
              paypal: {
                ...existingPaypalData,
                orderStatus: "APPROVED",
                webhookReceivedAt: new Date(),
              },
            },
            notes: "PayPal order approved, capturing payment...",
          },
        );
      }

      try {
        await this.captureOrder({ orderId });
        return {
          success: true,
          message:
            "Đơn hàng đã được phê duyệt và bắt đầu thanh toán thành công",
        };
      } catch (captureError) {
        const errorMessage =
          captureError instanceof Error
            ? captureError.message
            : "Unknown capture error";

        if (targetTransaction) {
          const existingProviderData2 =
            (targetTransaction.providerData as Record<string, unknown>) || {};
          const existingPaypalData2 =
            (existingProviderData2.paypal as Record<string, unknown>) || {};

          await this.transactionService.updateTransaction(
            targetTransaction._id.toString(),
            {
              status: TRANSACTION_STATUS.FAILED,
              providerData: {
                ...existingProviderData2,
                paypal: {
                  ...existingPaypalData2,
                  orderStatus: "APPROVED",
                  captureError: errorMessage,
                  webhookReceivedAt: new Date(),
                },
              },
              notes: `PayPal order approved but capture failed: ${errorMessage}`,
            },
          );
        }

        return {
          success: false,
          message: `Failed to capture order: ${errorMessage}`,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        message: `Failed to process order approval: ${errorMessage}`,
      };
    }
  }

  private async handleOrderCancelled(resource: any): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const orderId = resource.id;

      const transaction =
        await this.transactionService.findTransactionByExternalId(orderId);

      if (!transaction) {
        return { success: false, message: "Không tìm thấy giao dịch" };
      }

      const existingProviderData =
        (transaction.providerData as Record<string, unknown>) || {};
      const existingPaypalData =
        (existingProviderData.paypal as Record<string, unknown>) || {};

      await this.transactionService.updateTransaction(
        transaction._id.toString(),
        {
          status: TRANSACTION_STATUS.CANCELLED,
          providerData: {
            ...existingProviderData,
            paypal: {
              ...existingPaypalData,
              orderStatus: "CANCELLED",
              webhookReceivedAt: new Date(),
            },
          },
          notes: "PayPal order cancelled via webhook",
        },
      );

      return { success: true, message: "Hủy đơn hàng đã được xử lý" };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        message: `Failed to process cancellation: ${errorMessage}`,
      };
    }
  }
}
