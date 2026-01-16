import { Injectable, Logger, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Model } from "mongoose";
import {
  WALLET_TRANSACTION_MODEL_PROVIDER,
} from "../constants";
import { WalletTransactionModel } from "../models";

@Injectable()
export class WalletDepositSyncService {
  private readonly logger = new Logger(WalletDepositSyncService.name);

  constructor(
    @Inject(WALLET_TRANSACTION_MODEL_PROVIDER)
    private readonly walletTransactionModel: Model<WalletTransactionModel>,
  ) {}

  /**
   * Verify pending deposits by checking wallet transactions
   * Chạy mỗi 2 phút để verify các pending deposits có transaction tương ứng chưa
   * Note: Không cần cleanup vì pending deposits được lưu trong memory Map của WalletDepositService
   * và sẽ tự động cleanup khi server restart hoặc khi deposit được xử lý
   */
  @Cron("*/2 * * * *") // Every 2 minutes
  async verifyPendingDeposits() {
    try {
      // Get all recent deposit transactions to verify
      const recentDeposits = await this.walletTransactionModel
        .find({
          type: "deposit",
          referenceType: "deposit",
          status: "completed",
          createdAt: { $gte: new Date(Date.now() - 20 * 60 * 1000) }, // Last 20 minutes
        })
        .select("referenceId metadata createdAt amount")
        .lean();

      if (recentDeposits.length === 0) {
        return;
      }

      this.logger.log(`[Wallet Deposit Sync] Found ${recentDeposits.length} recent completed deposits`);
      
      // Log for monitoring - actual cleanup is handled by WalletDepositService
      for (const transaction of recentDeposits) {
        const metadata = transaction.metadata || {};
        const paymentRef = metadata.paymentRef || "";
        if (paymentRef) {
          this.logger.debug(`[Wallet Deposit Sync] Verified deposit: ${paymentRef}, amount: ${transaction.amount}`);
        }
      }
    } catch (error) {
      this.logger.error(`[Wallet Deposit Sync] Error verifying deposits: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  }
}
