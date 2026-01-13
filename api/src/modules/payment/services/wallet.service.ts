import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { Model, ClientSession } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { toObjectId } from "src/kernel/helpers/string.helper";
import { QueueMessageService } from "src/kernel";
import { WalletModel, WalletTransactionModel } from "../models";
import { WalletDto, WalletBalanceDto, WalletStatsDto } from "../dtos";
import {
  WALLET_MODEL_PROVIDER,
  WALLET_TRANSACTION_MODEL_PROVIDER,
  WALLET_OWNER_TYPE,
  WALLET_STATUS,
  WALLET_TRANSACTION_TYPE,
  WALLET_TRANSACTION_STATUS,
  SYSTEM_WALLET_ID,
} from "../constants";
import { IDepositData, IWithdrawData, IPurchaseData } from "../interfaces";

@Injectable()
export class WalletService {
  constructor(
    @Inject(WALLET_MODEL_PROVIDER)
    private readonly walletModel: Model<WalletModel>,
    @Inject(WALLET_TRANSACTION_MODEL_PROVIDER)
    private readonly walletTransactionModel: Model<WalletTransactionModel>,
    private readonly queueEventService: QueueMessageService,
  ) {}

  private generateTransactionCode(): string {
    return `WTX_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`;
  }

  async createWallet(
    ownerId: string,
    ownerType: string,
    currency: string = "VND",
  ): Promise<WalletDto> {
    const existingWallet = await this.walletModel
      .findOne({
        ownerId: toObjectId(ownerId),
        ownerType,
      })
      .lean();

    if (existingWallet) {
      return new WalletDto(existingWallet);
    }

    const wallet = new this.walletModel({
      ownerId: toObjectId(ownerId),
      ownerType,
      balance: 0,
      currency,
      status: WALLET_STATUS.ACTIVE,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalSpent: 0,
    });

    const savedWallet = await wallet.save();
    return new WalletDto(savedWallet.toObject());
  }

  async getOrCreateSystemWallet(): Promise<WalletDto> {
    let systemWallet = await this.walletModel
      .findOne({ ownerType: WALLET_OWNER_TYPE.SYSTEM })
      .lean();

    if (!systemWallet) {
      const wallet = new this.walletModel({
        ownerId: toObjectId(
          SYSTEM_WALLET_ID.replace(/[^a-f0-9]/gi, "")
            .padEnd(24, "0")
            .substring(0, 24),
        ),
        ownerType: WALLET_OWNER_TYPE.SYSTEM,
        balance: 0,
        currency: "VND",
        status: WALLET_STATUS.ACTIVE,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalSpent: 0,
      });
      systemWallet = (await wallet.save()).toObject();
    }

    return new WalletDto(systemWallet);
  }

  async findByOwner(
    ownerId: string,
    ownerType: string,
  ): Promise<WalletDto | null> {
    const wallet = await this.walletModel
      .findOne({
        ownerId: toObjectId(ownerId),
        ownerType,
      })
      .lean();

    return wallet ? new WalletDto(wallet) : null;
  }

  async findById(walletId: string): Promise<WalletDto | null> {
    const wallet = await this.walletModel.findById(toObjectId(walletId)).lean();

    return wallet ? new WalletDto(wallet) : null;
  }

  async getBalance(
    ownerId: string,
    ownerType: string,
  ): Promise<WalletBalanceDto> {
    const wallet = await this.findByOwner(ownerId, ownerType);
    if (!wallet) {
      throw new NotFoundException("Ví không tồn tại");
    }
    return new WalletBalanceDto(wallet);
  }

  async getStats(ownerId: string, ownerType: string): Promise<WalletStatsDto> {
    const wallet = await this.findByOwner(ownerId, ownerType);
    if (!wallet) {
      throw new NotFoundException("Ví không tồn tại");
    }
    return new WalletStatsDto(wallet);
  }

  async deposit(
    ownerId: string,
    ownerType: string,
    depositData: IDepositData,
    session?: ClientSession,
  ): Promise<WalletDto> {
    const wallet = await this.walletModel
      .findOne({
        ownerId: toObjectId(ownerId),
        ownerType,
      })
      .session(session || null);

    if (!wallet) {
      throw new NotFoundException("Ví không tồn tại");
    }

    if (wallet.status !== WALLET_STATUS.ACTIVE) {
      throw new BadRequestException("Ví đang bị khóa hoặc tạm ngưng");
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + depositData.amount;

    // Update user wallet
    wallet.balance = balanceAfter;
    wallet.totalDeposited += depositData.amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    // Create transaction record for user
    await this.walletTransactionModel.create(
      [
        {
          transactionCode: this.generateTransactionCode(),
          walletId: wallet._id,
          ownerId: toObjectId(ownerId),
          ownerType,
          type: WALLET_TRANSACTION_TYPE.DEPOSIT,
          amount: depositData.amount,
          balanceBefore,
          balanceAfter,
          currency: wallet.currency,
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
          description: depositData.description || "Nạp tiền vào ví",
          referenceId: depositData.referenceId,
          referenceType: depositData.referenceType || "deposit",
          metadata: depositData.metadata,
          completedAt: new Date(),
        },
      ],
      { session },
    );

    // Also add to system wallet
    await this.addToSystemWallet(
      depositData.amount,
      {
        description: `Nhận tiền nạp từ ${ownerType}: ${ownerId}`,
        referenceId: depositData.referenceId,
        referenceType: "deposit",
      },
      session,
    );

    return new WalletDto(wallet.toObject());
  }

  async withdraw(
    ownerId: string,
    ownerType: string,
    withdrawData: IWithdrawData,
    session?: ClientSession,
  ): Promise<WalletDto> {
    const wallet = await this.walletModel
      .findOne({
        ownerId: toObjectId(ownerId),
        ownerType,
      })
      .session(session || null);

    if (!wallet) {
      throw new NotFoundException("Ví không tồn tại");
    }

    if (wallet.status !== WALLET_STATUS.ACTIVE) {
      throw new BadRequestException("Ví đang bị khóa hoặc tạm ngưng");
    }

    if (wallet.balance < withdrawData.amount) {
      throw new BadRequestException("Số dư không đủ");
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - withdrawData.amount;

    // Update user wallet
    wallet.balance = balanceAfter;
    wallet.totalWithdrawn += withdrawData.amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    // Create transaction record for user
    await this.walletTransactionModel.create(
      [
        {
          transactionCode: this.generateTransactionCode(),
          walletId: wallet._id,
          ownerId: toObjectId(ownerId),
          ownerType,
          type: WALLET_TRANSACTION_TYPE.WITHDRAW,
          amount: withdrawData.amount,
          balanceBefore,
          balanceAfter,
          currency: wallet.currency,
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
          description: withdrawData.description || "Rút tiền từ ví",
          referenceId: withdrawData.referenceId,
          referenceType: withdrawData.referenceType || "withdraw",
          metadata: withdrawData.metadata,
          completedAt: new Date(),
        },
      ],
      { session },
    );

    // Also subtract from system wallet
    await this.subtractFromSystemWallet(
      withdrawData.amount,
      {
        description: `Chi tiền rút cho ${ownerType}: ${ownerId}`,
        referenceId: withdrawData.referenceId,
        referenceType: "withdraw",
      },
      session,
    );

    return new WalletDto(wallet.toObject());
  }

  async purchase(
    ownerId: string,
    ownerType: string,
    purchaseData: IPurchaseData,
    session?: ClientSession,
  ): Promise<WalletDto> {
    const wallet = await this.walletModel
      .findOne({
        ownerId: toObjectId(ownerId),
        ownerType,
      })
      .session(session || null);

    if (!wallet) {
      throw new NotFoundException("Ví không tồn tại");
    }

    if (wallet.status !== WALLET_STATUS.ACTIVE) {
      throw new BadRequestException("Ví đang bị khóa hoặc tạm ngưng");
    }

    if (wallet.balance < purchaseData.amount) {
      throw new BadRequestException("Số dư không đủ để thanh toán");
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - purchaseData.amount;

    // Update buyer wallet
    wallet.balance = balanceAfter;
    wallet.totalSpent += purchaseData.amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    // Create transaction record
    await this.walletTransactionModel.create(
      [
        {
          transactionCode: this.generateTransactionCode(),
          walletId: wallet._id,
          ownerId: toObjectId(ownerId),
          ownerType,
          type: WALLET_TRANSACTION_TYPE.PURCHASE,
          amount: purchaseData.amount,
          balanceBefore,
          balanceAfter,
          currency: wallet.currency,
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
          description: purchaseData.description || "Thanh toán đơn hàng",
          referenceId: purchaseData.orderId,
          referenceType: "order",
          metadata: purchaseData.metadata,
          completedAt: new Date(),
        },
      ],
      { session },
    );

    return new WalletDto(wallet.toObject());
  }

  async refund(
    ownerId: string,
    ownerType: string,
    amount: number,
    orderId: string,
    description?: string,
    session?: ClientSession,
  ): Promise<WalletDto> {
    const wallet = await this.walletModel
      .findOne({
        ownerId: toObjectId(ownerId),
        ownerType,
      })
      .session(session || null);

    if (!wallet) {
      throw new NotFoundException("Ví không tồn tại");
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Update wallet
    wallet.balance = balanceAfter;
    wallet.totalSpent -= amount;
    if (wallet.totalSpent < 0) wallet.totalSpent = 0;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    // Create transaction record
    await this.walletTransactionModel.create(
      [
        {
          transactionCode: this.generateTransactionCode(),
          walletId: wallet._id,
          ownerId: toObjectId(ownerId),
          ownerType,
          type: WALLET_TRANSACTION_TYPE.REFUND,
          amount,
          balanceBefore,
          balanceAfter,
          currency: wallet.currency,
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
          description: description || "Hoàn tiền đơn hàng",
          referenceId: orderId,
          referenceType: "refund",
          completedAt: new Date(),
        },
      ],
      { session },
    );

    return new WalletDto(wallet.toObject());
  }

  private async addToSystemWallet(
    amount: number,
    data: { description: string; referenceId?: string; referenceType?: string },
    session?: ClientSession,
  ): Promise<void> {
    const systemWallet = await this.walletModel
      .findOne({ ownerType: WALLET_OWNER_TYPE.SYSTEM })
      .session(session || null);

    if (!systemWallet) {
      return;
    }

    const balanceBefore = systemWallet.balance;
    const balanceAfter = balanceBefore + amount;

    systemWallet.balance = balanceAfter;
    systemWallet.totalDeposited += amount;
    systemWallet.lastTransactionAt = new Date();
    await systemWallet.save({ session });

    await this.walletTransactionModel.create(
      [
        {
          transactionCode: this.generateTransactionCode(),
          walletId: systemWallet._id,
          ownerId: systemWallet.ownerId,
          ownerType: WALLET_OWNER_TYPE.SYSTEM,
          type: WALLET_TRANSACTION_TYPE.DEPOSIT,
          amount,
          balanceBefore,
          balanceAfter,
          currency: systemWallet.currency,
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
          description: data.description,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
          completedAt: new Date(),
        },
      ],
      { session },
    );
  }

  private async subtractFromSystemWallet(
    amount: number,
    data: { description: string; referenceId?: string; referenceType?: string },
    session?: ClientSession,
  ): Promise<void> {
    const systemWallet = await this.walletModel
      .findOne({ ownerType: WALLET_OWNER_TYPE.SYSTEM })
      .session(session || null);

    if (!systemWallet) {
      return;
    }

    if (systemWallet.balance < amount) {
      throw new BadRequestException("Số dư ví hệ thống không đủ");
    }

    const balanceBefore = systemWallet.balance;
    const balanceAfter = balanceBefore - amount;

    systemWallet.balance = balanceAfter;
    systemWallet.totalWithdrawn += amount;
    systemWallet.lastTransactionAt = new Date();
    await systemWallet.save({ session });

    await this.walletTransactionModel.create(
      [
        {
          transactionCode: this.generateTransactionCode(),
          walletId: systemWallet._id,
          ownerId: systemWallet.ownerId,
          ownerType: WALLET_OWNER_TYPE.SYSTEM,
          type: WALLET_TRANSACTION_TYPE.WITHDRAW,
          amount,
          balanceBefore,
          balanceAfter,
          currency: systemWallet.currency,
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
          description: data.description,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
          completedAt: new Date(),
        },
      ],
      { session },
    );
  }

  async freezeWallet(walletId: string): Promise<WalletDto> {
    const wallet = await this.walletModel
      .findByIdAndUpdate(
        toObjectId(walletId),
        { $set: { status: WALLET_STATUS.FROZEN } },
        { new: true },
      )
      .lean();

    if (!wallet) {
      throw new NotFoundException("Ví không tồn tại");
    }

    return new WalletDto(wallet);
  }

  async unfreezeWallet(walletId: string): Promise<WalletDto> {
    const wallet = await this.walletModel
      .findByIdAndUpdate(
        toObjectId(walletId),
        { $set: { status: WALLET_STATUS.ACTIVE } },
        { new: true },
      )
      .lean();

    if (!wallet) {
      throw new NotFoundException("Ví không tồn tại");
    }

    return new WalletDto(wallet);
  }

  async getSystemWalletStats(): Promise<WalletStatsDto> {
    const systemWallet = await this.walletModel
      .findOne({ ownerType: WALLET_OWNER_TYPE.SYSTEM })
      .lean();

    if (!systemWallet) {
      throw new NotFoundException("Ví hệ thống không tồn tại");
    }

    return new WalletStatsDto(systemWallet);
  }

  /**
   * Deposit money directly to system wallet (for PayPal/ZaloPay payments)
   * This is used when a user pays for an order via online payment
   */
  async depositToSystemWallet(
    amount: number,
    data: {
      description: string;
      referenceId?: string;
      referenceType?: string;
    },
  ): Promise<void> {
    const systemWallet = await this.walletModel.findOne({
      ownerType: WALLET_OWNER_TYPE.SYSTEM,
    });

    if (!systemWallet) {
      // Create system wallet if not exists
      await this.getOrCreateSystemWallet();
      return this.depositToSystemWallet(amount, data);
    }

    const balanceBefore = systemWallet.balance;
    const balanceAfter = balanceBefore + amount;

    systemWallet.balance = balanceAfter;
    systemWallet.totalDeposited += amount;
    systemWallet.lastTransactionAt = new Date();
    await systemWallet.save();

    await this.walletTransactionModel.create([
      {
        transactionCode: this.generateTransactionCode(),
        walletId: systemWallet._id,
        ownerId: systemWallet.ownerId,
        ownerType: WALLET_OWNER_TYPE.SYSTEM,
        type: WALLET_TRANSACTION_TYPE.DEPOSIT,
        amount,
        balanceBefore,
        balanceAfter,
        currency: systemWallet.currency,
        status: WALLET_TRANSACTION_STATUS.COMPLETED,
        description: data.description,
        referenceId: data.referenceId,
        referenceType: data.referenceType || "deposit",
        completedAt: new Date(),
      },
    ]);
  }
}
