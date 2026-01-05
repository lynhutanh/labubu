import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { WalletService } from "./wallet.service";
import { PayPalService } from "./paypal.service";
import { ZaloPayService } from "./zalopay.service";
import { DepositPayload } from "../payloads";
import {
  WALLET_MODEL_PROVIDER,
  WALLET_TRANSACTION_MODEL_PROVIDER,
  WALLET_OWNER_TYPE,
} from "../constants";
import { WalletModel, WalletTransactionModel } from "../models";

interface IPendingDeposit {
  ownerId: string;
  ownerType: string;
  amount: number;
  paypalOrderId?: string;
  zaloPayTransId?: string;
  createdAt: Date;
}

@Injectable()
export class WalletDepositService {
  private pendingDeposits: Map<string, IPendingDeposit> = new Map();

  constructor(
    @Inject(WALLET_MODEL_PROVIDER)
    private readonly walletModel: Model<WalletModel>,
    @Inject(WALLET_TRANSACTION_MODEL_PROVIDER)
    private readonly walletTransactionModel: Model<WalletTransactionModel>,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => PayPalService))
    private readonly paypalService: PayPalService,
    @Inject(forwardRef(() => ZaloPayService))
    private readonly zalopayService: ZaloPayService,
  ) {}

  private generateTransactionCode(): string {
    return `DEP_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`;
  }

  async createPayPalDeposit(
    user: any,
    payload: DepositPayload,
  ): Promise<{
    paypalOrderId: string;
    approvalUrl: string;
    amount: number;
  }> {
    const ownerId = user._id.toString();

    const wallet = await this.walletService.findByOwner(
      ownerId,
      WALLET_OWNER_TYPE.USER,
    );
    if (!wallet) {
      throw new BadRequestException("Ví không tồn tại");
    }

    const paypalOrder = await this.paypalService.createOrder({
      amount: payload.amount,
      currency: "VND",
      description: payload.description || "Nạp tiền vào ví",
      customId: `DEPOSIT_${ownerId}_${Date.now()}`,
    });

    this.pendingDeposits.set(paypalOrder.id, {
      ownerId,
      ownerType: WALLET_OWNER_TYPE.USER,
      amount: payload.amount,
      paypalOrderId: paypalOrder.id,
      createdAt: new Date(),
    });

    return {
      paypalOrderId: paypalOrder.id,
      approvalUrl: paypalOrder.approvalUrl,
      amount: payload.amount,
    };
  }

  async capturePayPalDeposit(
    token: string,
    payerId: string,
  ): Promise<{
    success: boolean;
    message: string;
    newBalance?: number;
  }> {
    const pendingDeposit = this.pendingDeposits.get(token);

    if (!pendingDeposit) {
      throw new BadRequestException("Không tìm thấy đơn nạp tiền");
    }

    try {
      const captureResult = await this.paypalService.captureOrder({
        orderId: token,
      });

      if (captureResult.status !== "COMPLETED") {
        throw new BadRequestException("Thanh toán PayPal thất bại");
      }

      const updatedWallet = await this.walletService.deposit(
        pendingDeposit.ownerId,
        pendingDeposit.ownerType,
        {
          amount: pendingDeposit.amount,
          description: "Nạp tiền qua PayPal",
          referenceId: token,
          referenceType: "paypal",
          metadata: {
            paypalOrderId: token,
            payerId,
            captureId: captureResult.captureId,
          },
        },
      );

      this.pendingDeposits.delete(token);

      return {
        success: true,
        message: `Nạp thành công ${pendingDeposit.amount.toLocaleString("vi-VN")}đ vào ví`,
        newBalance: updatedWallet.balance,
      };
    } catch (error) {
      this.pendingDeposits.delete(token);
      throw error;
    }
  }

  async handlePayPalWebhook(
    webhookEvent: any,
  ): Promise<{ success: boolean; message: string }> {
    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const customId = resource.custom_id;

      if (customId && customId.startsWith("DEPOSIT_")) {
        const parts = customId.split("_");
        if (parts.length >= 3) {
          const ownerId = parts[1];
          const amount = parseFloat(resource.amount?.value || "0");

          await this.walletService.deposit(ownerId, WALLET_OWNER_TYPE.USER, {
            amount,
            description: "Nạp tiền qua PayPal (webhook)",
            referenceId: resource.id,
            referenceType: "paypal",
            metadata: {
              captureId: resource.id,
              webhookEventId: webhookEvent.id,
            },
          });

          return {
            success: true,
            message: "Đã xử lý nạp tiền thành công",
          };
        }
      }
    }

    return {
      success: true,
      message: `Event ${eventType} không cần xử lý`,
    };
  }

  async createZaloPayDeposit(
    user: any,
    payload: DepositPayload,
  ): Promise<{
    transId: string;
    orderUrl: string;
    amount: number;
  }> {
    const ownerId = user._id.toString();

    const wallet = await this.walletService.findByOwner(
      ownerId,
      WALLET_OWNER_TYPE.USER,
    );
    if (!wallet) {
      throw new BadRequestException("Ví không tồn tại");
    }

    const zaloPayOrder = await this.zalopayService.createOrder({
      amount: payload.amount,
      appUser: ownerId,
    });

    const transId = zaloPayOrder.apptransid || "";

    this.pendingDeposits.set(transId, {
      ownerId,
      ownerType: WALLET_OWNER_TYPE.USER,
      amount: payload.amount,
      zaloPayTransId: transId,
      createdAt: new Date(),
    });

    return {
      transId,
      orderUrl: zaloPayOrder.orderurl,
      amount: payload.amount,
    };
  }

  async handleZaloPayCallback(body: any): Promise<{
    returnCode: number;
    returnMessage: string;
  }> {
    try {
      const data = JSON.parse(body.data || "{}");
      const embedData = JSON.parse(data.embed_data || "{}");

      if (embedData.type !== "deposit") {
        return { returnCode: 1, returnMessage: "Không phải đơn nạp tiền" };
      }

      const { ownerId } = embedData;
      const amount = data.amount || 0;

      if (!ownerId || amount <= 0) {
        return { returnCode: 2, returnMessage: "Dữ liệu không hợp lệ" };
      }

      await this.walletService.deposit(ownerId, WALLET_OWNER_TYPE.USER, {
        amount,
        description: "Nạp tiền qua ZaloPay",
        referenceId: data.app_trans_id,
        referenceType: "zalopay",
        metadata: {
          zaloPayTransId: data.zp_trans_id,
          appTransId: data.app_trans_id,
        },
      });

      if (data.app_trans_id) {
        this.pendingDeposits.delete(data.app_trans_id);
      }

      return { returnCode: 1, returnMessage: "Thành công" };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { returnCode: 0, returnMessage: `Lỗi: ${errorMessage}` };
    }
  }
}
