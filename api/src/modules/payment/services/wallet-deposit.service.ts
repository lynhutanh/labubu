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
import { SePayService } from "./sepay.service";
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
  sepayPaymentRef?: string;
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
    @Inject(forwardRef(() => SePayService))
    private readonly sepayService: SePayService,
  ) {}

  private generateTransactionCode(): string {
    return `DEP_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`;
  }

  async createPayPalDeposit(
    user: any,
    payload: DepositPayload,
    frontendBaseUrl?: string,
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

    const baseUrl = frontendBaseUrl || "http://localhost:3000";
    const returnUrl = `${baseUrl}/profile/wallet-callback?token={token}&PayerID={PayerID}`;
    const cancelUrl = `${baseUrl}/profile/wallet`;

    const paypalOrder = await this.paypalService.createOrder({
      amount: payload.amount,
      currency: "VND",
      description: payload.description || "Nạp tiền vào ví",
      customId: `DEPOSIT_${ownerId}_${Date.now()}`,
      returnUrl,
      cancelUrl,
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
          referenceType: "deposit", // Use 'deposit' as it's a valid enum value
          metadata: {
            paypalOrderId: token,
            payerId,
            captureId: captureResult.captureId,
            paymentMethod: "paypal", // Store payment method in metadata
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
            referenceType: "deposit", // Use 'deposit' as it's a valid enum value
            metadata: {
              captureId: resource.id,
              webhookEventId: webhookEvent.id,
              paymentMethod: "paypal", // Store payment method in metadata
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
        referenceType: "deposit", // Use 'deposit' as it's a valid enum value
        metadata: {
          zaloPayTransId: data.zp_trans_id,
          appTransId: data.app_trans_id,
          paymentMethod: "zalopay", // Store payment method in metadata
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

  async createSePayDeposit(
    user: any,
    payload: DepositPayload,
  ): Promise<{
    paymentRef: string;
    qrUrl: string;
    amount: number;
    expiredAt: Date;
  }> {
    const ownerId = user._id.toString();

    const wallet = await this.walletService.findByOwner(
      ownerId,
      WALLET_OWNER_TYPE.USER,
    );
    if (!wallet) {
      throw new BadRequestException("Ví không tồn tại");
    }

    const depositCode = `DEP_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`;
    const paymentRef = `DEPOSIT_${depositCode}`;

    const accountInfo = this.sepayService.getAccountInfo();
    const qrUrl = this.sepayService.generateQRUrl({
      account: accountInfo.account,
      bank: accountInfo.bank,
      amount: payload.amount,
      description: paymentRef,
    });

    const expiredAt = new Date(Date.now() + accountInfo.webhookTimeout);

    this.pendingDeposits.set(paymentRef, {
      ownerId,
      ownerType: WALLET_OWNER_TYPE.USER,
      amount: payload.amount,
      sepayPaymentRef: paymentRef,
      createdAt: new Date(),
    });

    return {
      paymentRef,
      qrUrl,
      amount: payload.amount,
      expiredAt,
    };
  }

  async handleSePayWebhook(
    payload: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const content = payload.content || payload.description || payload.noidung;
      const amount = payload.transferAmount || payload.amount || payload.money;
      const transactionId = payload.referenceCode || payload.id?.toString() || payload.transaction_id;

      console.log(`[Wallet Deposit SePay] Webhook received:`, {
        content,
        amount,
        transactionId,
        fullPayload: JSON.stringify(payload),
      });

      // SePay transform content: "114716571705-DEPOSITDEP1768529468533FE9E6926-CHUYEN TIEN-..."
      // PaymentRef gốc: "DEPOSIT_DEP_1768529468533_FE9E6926"
      // Cần extract "DEPOSITDEP1768529468533FE9E6926" và normalize để match
      
      if (!content || !content.includes("DEPOSIT")) {
        console.log(`[Wallet Deposit SePay] Not a deposit - content: ${content}`);
        return {
          success: true,
          message: "Không phải đơn nạp tiền",
        };
      }

      // Extract DEPOSIT code from content
      // Content từ SePay: "114716571705-DEPOSITDEP1768529468533FE9E6926-CHUYEN TIEN-..."
      // PaymentRef gốc: "DEPOSIT_DEP_1768529468533_FE9E6926"
      // SePay transform: "DEPOSITDEP1768529468533FE9E6926" (bỏ dấu gạch dưới)
      
      // Pattern 1: DEPOSITDEP[timestamp][uuid] (SePay transform - không có dấu gạch)
      // Pattern 2: DEPOSIT_DEP_[timestamp]_[uuid] (format gốc)
      const depositPattern1 = /DEPOSITDEP([0-9]{13})([A-Z0-9]{8,})/i; // DEPOSITDEP + 13 digits timestamp + uuid
      const depositPattern2 = /DEPOSIT[_\s-]?DEP[_\s-]?([0-9]+)[_\s-]?([A-Z0-9]{8,})/i; // DEPOSIT_DEP_ + timestamp + uuid
      
      let normalizedPaymentRef: string | null = null;
      let match = content.match(depositPattern1);
      
      if (match) {
        // SePay transform format: DEPOSITDEP1768529468533FE9E6926
        const timestamp = match[1]; // 13 digits
        const uuid = match[2].substring(0, 8).toUpperCase(); // First 8 chars
        normalizedPaymentRef = `DEPOSIT_DEP_${timestamp}_${uuid}`;
        console.log(`[Wallet Deposit SePay] Extracted from SePay format: ${normalizedPaymentRef} from content: ${content}`);
      } else {
        match = content.match(depositPattern2);
        if (match) {
          // Original format: DEPOSIT_DEP_1768529468533_FE9E6926
          const timestamp = match[1];
          const uuid = match[2].substring(0, 8).toUpperCase();
          normalizedPaymentRef = `DEPOSIT_DEP_${timestamp}_${uuid}`;
          console.log(`[Wallet Deposit SePay] Extracted from original format: ${normalizedPaymentRef} from content: ${content}`);
        } else if (content.startsWith("DEPOSIT_")) {
          // Already in correct format, take first part
          normalizedPaymentRef = content.split("-")[0].split(" ")[0];
          console.log(`[Wallet Deposit SePay] Using content as-is: ${normalizedPaymentRef}`);
        }
      }

      // Try to find pending deposit
      let pendingDeposit: IPendingDeposit | undefined;
      
      // Strategy 1: Try with normalized paymentRef if extracted
      if (normalizedPaymentRef) {
        pendingDeposit = this.pendingDeposits.get(normalizedPaymentRef);
        if (pendingDeposit) {
          console.log(`[Wallet Deposit SePay] Found by normalized paymentRef: ${normalizedPaymentRef}`);
        }
      }
      
      // Strategy 2: Try exact match with original content (first part before dash)
      if (!pendingDeposit) {
        const contentFirstPart = content.split("-")[0].split(" ")[0];
        pendingDeposit = this.pendingDeposits.get(contentFirstPart);
        if (pendingDeposit) {
          console.log(`[Wallet Deposit SePay] Found by content first part: ${contentFirstPart}`);
        }
      }
      
      // Strategy 3: Try partial match (normalize and compare)
      if (!pendingDeposit) {
        console.log(`[Wallet Deposit SePay] Exact match not found, trying partial match...`);
        const normalizedContent = content.replace(/[_\s-]/g, "").toUpperCase();
        
        for (const [key, value] of this.pendingDeposits.entries()) {
          const normalizedKey = key.replace(/[_\s-]/g, "").toUpperCase();
          
          // Extract timestamp and uuid from both
          const contentMatch = normalizedContent.match(/DEPOSITDEP([0-9]+)([A-Z0-9]{8,})/i);
          const keyMatch = normalizedKey.match(/DEPOSITDEP([0-9]+)([A-Z0-9]{8,})/i);
          
          if (contentMatch && keyMatch) {
            // Match by timestamp and first 8 chars of uuid
            if (contentMatch[1] === keyMatch[1] && 
                contentMatch[2].substring(0, 8) === keyMatch[2].substring(0, 8)) {
              console.log(`[Wallet Deposit SePay] Found partial match: ${key} -> ${content}`);
              pendingDeposit = value;
              break;
            }
          }
        }
      }

      if (!pendingDeposit) {
        console.log(`[Wallet Deposit SePay] Pending deposit not found. Available keys:`, Array.from(this.pendingDeposits.keys()));
        return {
          success: false,
          message: `Không tìm thấy đơn nạp tiền với content: ${content}`,
        };
      }

      console.log(`[Wallet Deposit SePay] Found pending deposit:`, {
        ownerId: pendingDeposit.ownerId,
        amount: pendingDeposit.amount,
        receivedAmount: amount,
      });

      if (pendingDeposit.amount !== amount) {
        console.log(`[Wallet Deposit SePay] Amount mismatch: expected ${pendingDeposit.amount}, received ${amount}`);
        return {
          success: false,
          message: `Số tiền không khớp. Đơn nạp: ${pendingDeposit.amount}, Chuyển khoản: ${amount}`,
        };
      }

      const existingTransaction = await this.walletTransactionModel.findOne({
        referenceId: transactionId,
        referenceType: "deposit",
        type: "deposit",
        "metadata.paymentMethod": "sepay", // Check payment method in metadata
      });

      if (existingTransaction) {
        this.pendingDeposits.delete(content);
        return {
          success: true,
          message: "Giao dịch đã được xử lý trước đó",
        };
      }

      console.log(`[Wallet Deposit SePay] Processing deposit for owner: ${pendingDeposit.ownerId}, amount: ${pendingDeposit.amount}`);

      const depositResult = await this.walletService.deposit(
        pendingDeposit.ownerId,
        pendingDeposit.ownerType,
        {
          amount: pendingDeposit.amount,
          description: "Nạp tiền qua chuyển khoản ngân hàng",
          referenceId: transactionId || content,
          referenceType: "deposit", // Use 'deposit' as it's a valid enum value
          metadata: {
            paymentRef: content,
            transactionId,
            transferAmount: amount,
            content,
            paymentMethod: "sepay", // Store payment method in metadata
          },
        },
      );

      console.log(`[Wallet Deposit SePay] Deposit completed:`, depositResult);

      // Delete from pending deposits (try both exact and partial match)
      this.pendingDeposits.delete(content);
      for (const [key] of this.pendingDeposits.entries()) {
        if (content.includes(key) || key.includes(content.replace(/[_\s-]/g, ""))) {
          this.pendingDeposits.delete(key);
          break;
        }
      }

      return {
        success: true,
        message: "Đã xử lý nạp tiền thành công",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        message: `Lỗi xử lý nạp tiền: ${errorMessage}`,
      };
    }
  }
}
