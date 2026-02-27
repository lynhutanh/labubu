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

        // 2. Get ranking config from settings
        const rankingConfig = await this.settingService.get("membership_ranking");
        if (!rankingConfig) {
            await user.save();
            return;
        }

        // 3. Determine new rank
        let newRank = user.rank || USER_RANK.COPPER;
        const ranks = [
            { key: USER_RANK.COPPER, threshold: 0 },
            { key: USER_RANK.SILVER, threshold: rankingConfig.silverThreshold || 1000000 },
            { key: USER_RANK.GOLD, threshold: rankingConfig.goldThreshold || 5000000 },
            { key: USER_RANK.DIAMOND, threshold: rankingConfig.diamondThreshold || 20000000 },
            { key: USER_RANK.EMERALD, threshold: rankingConfig.emeraldThreshold || 100000000 },
        ];

        // Find the highest rank that user qualifies for
        for (let i = ranks.length - 1; i >= 0; i--) {
            if (newTotalSpent >= ranks[i].threshold) {
                newRank = ranks[i].key;
                break;
            }
        }

        const oldRank = user.rank;
        user.rank = newRank;

        // 4. Handle Rewards if rank changed
        if (newRank !== oldRank) {
            const rewardVoucherCode = rankingConfig[`${newRank}RewardVoucher`];
            if (rewardVoucherCode && !user.receivedRewards.includes(rewardVoucherCode)) {
                await this.giveReward(user, rewardVoucherCode);
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
