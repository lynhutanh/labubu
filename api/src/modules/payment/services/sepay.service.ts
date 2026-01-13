import { Injectable, BadRequestException, Inject, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { Model, ClientSession } from "mongoose";
import { OrderModel } from "src/modules/orders/models";
import { TransactionModel } from "../models";
import { TransactionService } from "./transaction.service";
import {
    ORDER_PROVIDER,
    ORDER_STATUS,
    PAYMENT_STATUS,
} from "src/modules/orders/constants";
import { PAYMENT_PROVIDER, PAYMENT_METHOD } from "../constants";
import { TRANSACTION_MODEL_PROVIDER } from "../providers";
import { CreateTransactionDto } from "../dtos";
import { SettingService } from "src/modules/settings/services";

export interface ISePayWebhookPayload {
    merchant_id: string;
    transaction_id: string;
    amount: number;
    content: string;
    status: string;
    signature: string;
    [key: string]: any;
}

export interface ISePayQRParams {
    account: string;
    bank: string;
    amount: number;
    description: string;
}

@Injectable()
export class SePayService implements OnModuleInit {
    private merchantId: string = "";
    private secretKey: string = "";
    private account: string = "";
    private bank: string = "VIB";
    private qrBaseUrl: string = "https://qr.sepay.vn/img";
    private webhookTimeout: number = 900000; // 15 minutes default

    constructor(
        private readonly configService: ConfigService,
        @Inject(ORDER_PROVIDER)
        private readonly orderModel: Model<OrderModel>,
        @Inject(TRANSACTION_MODEL_PROVIDER)
        private readonly transactionModel: Model<TransactionModel>,
        private readonly transactionService: TransactionService,
        private readonly settingService: SettingService,
    ) {
        // Load từ ENV trước (fallback)
        this.loadFromEnv();
    }

    async onModuleInit() {
        // Load từ settings sau khi module khởi tạo
        await this.loadFromSettings();
    }

    private loadFromEnv() {
        // Fallback: Load từ ENV nếu settings chưa có
        this.merchantId = process.env.SEPAY_MERCHANT_ID || "";
        this.secretKey = process.env.SEPAY_SECRET_KEY || "";
        this.account = process.env.SEPAY_ACCOUNT || "";
        this.bank = process.env.SEPAY_BANK || "VIB";
        this.webhookTimeout = parseInt(process.env.SEPAY_WEBHOOK_TIMEOUT || "900000", 10);
    }

    private async loadFromSettings() {
        try {
            // Load từ settings (ưu tiên)
            const merchantId = await this.settingService.get("sepayMerchantId");
            const secretKey = await this.settingService.get("sepaySecretKey");
            const account = await this.settingService.get("sepayAccount");
            const bank = await this.settingService.get("sepayBank");
            const webhookTimeout = await this.settingService.get("sepayWebhookTimeout");

            if (merchantId) this.merchantId = merchantId;
            if (secretKey) this.secretKey = secretKey;
            if (account) this.account = account;
            if (bank) this.bank = bank;
            if (webhookTimeout) {
                this.webhookTimeout = typeof webhookTimeout === "number"
                    ? webhookTimeout
                    : parseInt(String(webhookTimeout), 10) || 900000;
            }
        } catch (error) {
            // Nếu không load được từ settings, giữ nguyên giá trị từ ENV
        }
    }

    private async refreshSettings() {
        await this.loadFromSettings();
    }

    /**
     * Generate QR code URL for SePay
     */
    generateQRUrl(params: ISePayQRParams): string {
        const { account, bank, amount, description } = params;

        if (!account || !bank || !amount || !description) {
            throw new BadRequestException("Thiếu thông tin để tạo QR thanh toán");
        }

        const url = new URL(this.qrBaseUrl);
        url.searchParams.append("acc", account);
        url.searchParams.append("bank", bank);
        url.searchParams.append("amount", amount.toString());
        url.searchParams.append("des", description);
        url.searchParams.append("template", "compact");

        return url.toString();
    }

    /**
     * Verify webhook signature
     * Chưa xác minh - giả định format: HMAC SHA256(raw_string, SECRET_KEY)
     * raw_string = merchant_id + transaction_id + amount + content + status
     */
    verifySignature(payload: ISePayWebhookPayload): boolean {
        if (!this.secretKey) {
            throw new BadRequestException("SECRET_KEY chưa được cấu hình");
        }

        // Chưa xác minh - giả định cách tạo signature
        const rawString =
            payload.merchant_id +
            payload.transaction_id +
            payload.amount.toString() +
            payload.content +
            payload.status;

        const expectedSignature = crypto
            .createHmac("sha256", this.secretKey)
            .update(rawString)
            .digest("hex");

        // Constant-time comparison để tránh timing attack
        const signatureBuffer = Buffer.from(payload.signature, "hex");
        const expectedBuffer = Buffer.from(expectedSignature, "hex");

        if (signatureBuffer.length !== expectedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    }

    /**
     * Verify merchant ID
     */
    verifyMerchantId(merchantId: string): boolean {
        return merchantId === this.merchantId;
    }

    /**
     * Handle webhook from SePay
     * Idempotent: nếu transaction đã xử lý, không xử lý lại
     */
    async handleWebhook(
        payload: any,
        session?: ClientSession,
    ): Promise<{ success: boolean; message: string }> {
        // Refresh settings trước khi xử lý webhook (có thể đã được cập nhật từ admin)
        await this.refreshSettings();

        // Extract fields từ payload thực tế của SePay
        // SePay payload structure:
        // - transferAmount: số tiền
        // - referenceCode: mã giao dịch
        // - transferType: 'in' = nhận tiền, 'out' = chuyển tiền
        // - content: nội dung chuyển khoản
        // - transactionDate: thời gian giao dịch
        const transactionId =
            payload.referenceCode ||
            payload.id?.toString() ||
            payload.transaction_id ||
            payload.transactionId;
        const content =
            payload.content ||
            payload.description ||
            payload.noidung ||
            payload.message;
        const amount =
            payload.transferAmount ||
            payload.amount ||
            payload.money ||
            payload.total;
        const transferType = payload.transferType || payload.type || "in";
        const transactionDate = payload.transactionDate
            ? new Date(payload.transactionDate)
            : new Date();
        const referenceCode = payload.referenceCode || payload.id?.toString();

        try {
            // STEP 1: KHÔNG CHECK merchant_id (SePay không gửi)

            // STEP 2: KHÔNG CHECK signature (SePay không gửi)

            // STEP 3: Check if transaction already processed (idempotent) - dùng referenceCode
            const existingTransaction = await this.transactionModel.findOne({
                externalTransactionId: referenceCode || transactionId,
                paymentProvider: PAYMENT_PROVIDER.SEPAY,
            });

            if (existingTransaction) {
                return {
                    success: true,
                    message: "Giao dịch đã được xử lý trước đó",
                };
            }

            // 4. Find order by payment_ref (content)
            // SePay có thể transform content (bỏ dấu gạch ngang, thêm thông tin khác)
            // Cần extract payment_ref từ content

            let order: any = null;

            // Strategy 1: Tìm trực tiếp bằng content
            order = await this.orderModel.findOne({
                paymentRef: content,
                paymentMethod: PAYMENT_METHOD.SEPAY,
            });

            if (!order) {
                // Strategy 2: Extract order code từ content (SePay có thể transform)
                // Format content: "114358090665-SPORDMKC28QVA4LRX3W-CHUYEN TIEN-..."
                // Payment ref của chúng ta: "SP_ORD-MKC28QVA-4LRX3W"
                // Order number: "ORD-MKC28QVA-4LRX3W"
                // SePay transform: "SPORDMKC28QVA4LRX3W" (bỏ dấu gạch ngang)

                // Tìm pattern SP + ORD + order code (bỏ dấu gạch ngang)
                // Pattern: SPORD + [order code không có dấu gạch ngang]
                const spPattern = /SP[_-]?ORD[_-]?([A-Z0-9]{10,})/i;
                const match = content?.match(spPattern);

                if (match) {
                    const extractedCode = match[1]; // "MKC28QVA4LRX3W"

                    // Tìm tất cả SePay orders có paymentRef
                    const allSePayOrders = await this.orderModel
                        .find({
                            paymentMethod: PAYMENT_METHOD.SEPAY,
                            paymentRef: { $exists: true, $ne: "" },
                        })
                        .select("orderNumber paymentRef")
                        .lean();


                    // Match chính xác: tìm order có orderNumber chứa extractedCode
                    // Ví dụ: extractedCode = "MKC28QVA4LRX3W"
                    // Order number = "ORD-MKC28QVA-4LRX3W" → normalize = "ORDMKC28QVA4LRX3W"
                    // Check: normalizedOrderNumber.includes(extractedCode)
                    for (const o of allSePayOrders) {
                        if (!o.paymentRef || !o.orderNumber) continue;

                        // Normalize orderNumber: bỏ dấu gạch ngang
                        const normalizedOrderNumber = o.orderNumber
                            .replace(/[_-]/g, "")
                            .toUpperCase();
                        const normalizedExtracted = extractedCode.toUpperCase();

                        // Match chính xác: orderNumber phải chứa extractedCode
                        // Và paymentRef cũng phải match
                        const normalizedRef = o.paymentRef
                            .replace(/[_-]/g, "")
                            .toUpperCase();
                        const normalizedContent = content
                            .replace(/[_-]/g, "")
                            .toUpperCase();

                        // Check: orderNumber chứa extractedCode VÀ content chứa paymentRef
                        if (
                            normalizedOrderNumber.includes(normalizedExtracted) &&
                            normalizedContent.includes(normalizedRef)
                        ) {
                            order = await this.orderModel.findById(o._id);
                            break;
                        }
                    }
                }

                if (!order) {
                    return {
                        success: false,
                        message: "Không tìm thấy đơn hàng với nội dung chuyển khoản này",
                    };
                }
            }

            // 5. Verify order status
            if (order.status !== ORDER_STATUS.PENDING) {
                return {
                    success: false,
                    message: `Đơn hàng không ở trạng thái PENDING. Trạng thái hiện tại: ${order.status}`,
                };
            }

            // 6. Verify amount
            if (order.total !== amount) {
                return {
                    success: false,
                    message: `Số tiền không khớp. Đơn hàng: ${order.total}, Chuyển khoản: ${amount}`,
                };
            }

            // STEP 5: Check transfer type (phải là 'in' = nhận tiền)
            if (transferType !== "in") {
                return {
                    success: false,
                    message: `Loại giao dịch không hợp lệ. Phải là 'in' (nhận tiền), nhận được: ${transferType}`,
                };
            }

            // STEP 6: Check if order expired (optional - có thể bỏ qua nếu SePay vẫn gửi webhook)
            const now = new Date();
            const orderAge = now.getTime() - order.createdAt.getTime();
            if (orderAge > this.webhookTimeout) {
                // Không reject, vì SePay đã gửi webhook
            }

            // STEP 6: Create transaction record
            const transactionData: CreateTransactionDto = {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                userId: order.buyerId.toString(),
                userEmail: "",
                userName: "",
                amount: amount,
                currency: "VND",
                description: `SePay payment for order ${order.orderNumber}`,
                paymentMethod: PAYMENT_METHOD.SEPAY,
                paymentProvider: PAYMENT_PROVIDER.SEPAY,
                externalTransactionId: referenceCode || transactionId,
                providerData: {
                    gateway: payload.gateway,
                    referenceCode: referenceCode,
                    transferType: transferType,
                    transactionDate: transactionDate.toISOString(),
                    content: content,
                },
                rawWebhook: payload,
            };

            const transaction = await this.transactionService.createTransaction(
                transactionData,
                session,
            );

            // STEP 7: Update order status
            await this.orderModel.updateOne(
                { _id: order._id },
                {
                    $set: {
                        status: ORDER_STATUS.PROCESSING, // Khi thanh toán thành công → "Người bán đang chuẩn bị hàng"
                        paymentStatus: PAYMENT_STATUS.PAID,
                        paidAt: transactionDate,
                        paymentTransactionId: transaction._id,
                        confirmedAt: new Date(), // Đánh dấu thời điểm xác nhận đơn hàng
                    },
                },
                { session },
            );


            // STEP 8: Trả response thành công (BẮT BUỘC HTTP 200)
            return {
                success: true,
                message: "Xác nhận thanh toán thành công",
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            return {
                success: false,
                message: `Lỗi xử lý webhook: ${errorMessage}`,
            };
        }
    }

    /**
     * Get payment info for order
     */
    async getPaymentInfo(orderCode: string): Promise<{
        amount: number;
        paymentRef: string;
        qrUrl: string;
        expiredAt: Date;
    }> {
        // Refresh settings trước khi sử dụng (có thể đã được cập nhật từ admin)
        await this.refreshSettings();
        const order = await this.orderModel.findOne({
            orderNumber: orderCode,
            paymentMethod: PAYMENT_METHOD.SEPAY,
        });

        if (!order) {
            throw new BadRequestException("Không tìm thấy đơn hàng");
        }

        if (!order.paymentRef) {
            throw new BadRequestException("Đơn hàng chưa có payment_ref");
        }


        const qrUrl = this.generateQRUrl({
            account: this.account,
            bank: this.bank,
            amount: order.total,
            description: order.paymentRef,
        });

        const expiredAt = new Date(order.createdAt.getTime() + this.webhookTimeout);

        return {
            amount: order.total,
            paymentRef: order.paymentRef,
            qrUrl,
            expiredAt,
        };
    }
}
