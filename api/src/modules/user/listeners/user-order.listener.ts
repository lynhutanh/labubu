import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Model } from "mongoose";
import { QueueEventListener, QueueMessageService } from "src/kernel";
import { EVENT } from "src/kernel/constants";
import { logError } from "src/lib/utils";
import { PAYMENT_CHANNELS, PAYMENT_TOPICS } from "src/modules/payment/constants";
import { USER_MODEL_PROVIDER } from "../providers";
import { UserModel } from "../models";
import { USER_RANK } from "../constants";
import { SettingService } from "src/modules/settings/services";
import { VoucherService } from "src/modules/voucher/services";
import { TransactionService } from "src/modules/payment/services";
import { ORDER_STATUS } from "src/modules/orders/constants";
import { RankService } from "src/modules/member-rank/services/rank.service";

@Injectable()
export class UserOrderListener {
    constructor(
        private readonly queueEventService: QueueMessageService,
        @Inject(USER_MODEL_PROVIDER)
        private readonly userModel: Model<UserModel>,
        private readonly settingService: SettingService,
        @Inject(forwardRef(() => VoucherService))
        private readonly voucherService: VoucherService,
        @Inject(forwardRef(() => TransactionService))
        private readonly transactionService: TransactionService,
        @Inject(forwardRef(() => RankService))
        private readonly rankService: RankService,
    ) {
        this.queueEventService.subscribe(
            PAYMENT_CHANNELS.PAYMENT_SUCCESS,
            PAYMENT_TOPICS.PAYMENT_SUCCESS,
            this.handlePaymentSuccess.bind(this),
        );
        this.queueEventService.subscribe(
            'ORDER_UPDATED_CHANNEL',
            'HANDLE_ORDER_RANKING',
            this.handleOrderUpdated.bind(this),
        );
    }

    public async handlePaymentSuccess({ data: event }: QueueEventListener) {
        const { eventName, data } = event;
        if (eventName !== EVENT.UPDATED) return;

        try {
            const { transactionId } = data;
            if (!transactionId) return;

            const transaction = await this.transactionService.findTransactionById(transactionId);
            if (!transaction || !transaction.userId) return;

            await this.updateUserRank(transaction.userId.toString(), transaction.amount);
        } catch (e) {
            logError("handlePaymentSuccess", e);
        }
    }

    public async handleOrderUpdated({ data: event }: QueueEventListener) {
        const { eventName, data } = event;
        if (eventName !== EVENT.UPDATED) return;

        try {
            const order = data;
            if (!order || !order.buyerId) return;

            // Handle refund status
            if (order.status === ORDER_STATUS.REFUNDED) {
                // Deduct total spent by the order total amount
                await this.updateUserRank(order.buyerId.toString(), -order.total);
            }
        } catch (e) {
            logError("handleOrderUpdated", e);
        }
    }

    private async updateUserRank(userId: string, amount: number) {
        const user = await this.userModel.findById(userId);
        if (!user) return;

        // 1. Update total spent
        const newTotalSpent = (user.totalSpent || 0) + amount;
        user.totalSpent = newTotalSpent;

        // 2. Get all ranks
        const { data: ranks } = await this.rankService.search();
        if (!ranks || ranks.length === 0) {
            await user.save();
            return;
        }

        // 3. Determine new rank
        let currentRank = ranks[0]; // Default to lowest
        for (let i = ranks.length - 1; i >= 0; i--) {
            if (newTotalSpent >= ranks[i].threshold) {
                currentRank = ranks[i];
                break;
            }
        }

        const oldRankKey = user.rank;
        const newRankKey = currentRank.key;
        user.rank = newRankKey;

        // 4. Handle Rewards if rank changed
        if (newRankKey !== oldRankKey) {
            // Check if user has already received this rank's reward
            if (currentRank.rewardVoucherCode && !user.receivedRewards.includes(currentRank.rewardVoucherCode)) {
                await this.giveReward(user, currentRank.rewardVoucherCode);
            }
        }

        await user.save();
    }

    private async giveReward(user: UserModel, voucherCode: string) {
        try {
            const voucher = await this.voucherService.findByCode(voucherCode);
            if (!voucher) return;

            // Add user to applicableUsers of the voucher
            await this.voucherService.update(voucher._id.toString(), {
                applicableUsers: [...(voucher.applicableUsers || []), user._id.toString()],
            } as any);

            // Add voucher to user's received awards
            user.receivedRewards.push(voucherCode);

            // Note: Here we could trigger an email or notification
            console.log(`User ${user.email} reached ${user.rank} and received voucher ${voucherCode}`);
        } catch (e) {
            logError("giveReward", e);
        }
    }
}
