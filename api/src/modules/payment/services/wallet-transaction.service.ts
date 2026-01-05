import { Injectable, Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { toObjectId } from "src/kernel/helpers/string.helper";
import { WalletTransactionModel } from "../models";
import {
  WalletTransactionDto,
  WalletTransactionSearchResponseDto,
} from "../dtos";
import { WALLET_TRANSACTION_MODEL_PROVIDER } from "../constants";
import {
  IWalletTransactionFilter,
  IWalletTransactionSortOptions,
} from "../interfaces";

@Injectable()
export class WalletTransactionService {
  constructor(
    @Inject(WALLET_TRANSACTION_MODEL_PROVIDER)
    private readonly walletTransactionModel: Model<WalletTransactionModel>,
  ) {}

  async findById(transactionId: string): Promise<WalletTransactionDto | null> {
    const transaction = await this.walletTransactionModel
      .findById(toObjectId(transactionId))
      .lean();

    return transaction ? new WalletTransactionDto(transaction) : null;
  }

  async findByCode(
    transactionCode: string,
  ): Promise<WalletTransactionDto | null> {
    const transaction = await this.walletTransactionModel
      .findOne({ transactionCode })
      .lean();

    return transaction ? new WalletTransactionDto(transaction) : null;
  }

  async getTransactionHistory(
    ownerId: string,
    ownerType: string,
    filter: IWalletTransactionFilter = {},
    sortOptions: IWalletTransactionSortOptions = { createdAt: -1 },
    limit: number = 20,
    offset: number = 0,
  ): Promise<WalletTransactionSearchResponseDto> {
    const query: any = {
      ownerId: toObjectId(ownerId),
      ownerType,
    };

    if (filter.type) {
      query.type = filter.type;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      query.createdAt = {};
      if (filter.startDate) {
        query.createdAt.$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        query.createdAt.$lte = new Date(filter.endDate);
      }
    }

    if (filter.referenceId) {
      query.referenceId = filter.referenceId;
    }

    if (filter.referenceType) {
      query.referenceType = filter.referenceType;
    }

    const [transactions, total] = await Promise.all([
      this.walletTransactionModel
        .find(query)
        .sort(sortOptions)
        .skip(offset)
        .limit(limit)
        .lean(),
      this.walletTransactionModel.countDocuments(query),
    ]);

    const data = transactions.map((t) => new WalletTransactionDto(t));

    return new WalletTransactionSearchResponseDto(data, total, limit, offset);
  }

  async getTransactionsByWallet(
    walletId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<WalletTransactionSearchResponseDto> {
    const query = { walletId: toObjectId(walletId) };

    const [transactions, total] = await Promise.all([
      this.walletTransactionModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      this.walletTransactionModel.countDocuments(query),
    ]);

    const data = transactions.map((t) => new WalletTransactionDto(t));

    return new WalletTransactionSearchResponseDto(data, total, limit, offset);
  }

  async getTransactionsByReference(
    referenceId: string,
    referenceType: string,
  ): Promise<WalletTransactionDto[]> {
    const transactions = await this.walletTransactionModel
      .find({ referenceId, referenceType })
      .sort({ createdAt: -1 })
      .lean();

    return transactions.map((t) => new WalletTransactionDto(t));
  }

  async getRecentTransactions(
    ownerId: string,
    ownerType: string,
    limit: number = 10,
  ): Promise<WalletTransactionDto[]> {
    const transactions = await this.walletTransactionModel
      .find({
        ownerId: toObjectId(ownerId),
        ownerType,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return transactions.map((t) => new WalletTransactionDto(t));
  }

  async getTransactionStats(
    ownerId: string,
    ownerType: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalPurchases: number;
    totalRefunds: number;
    transactionCount: number;
  }> {
    const query: any = {
      ownerId: toObjectId(ownerId),
      ownerType,
      status: "completed",
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    const result = await this.walletTransactionModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalPurchases: 0,
      totalRefunds: 0,
      transactionCount: 0,
    };

    result.forEach((item) => {
      stats.transactionCount += item.count;
      switch (item._id) {
        case "deposit":
          stats.totalDeposits = item.total;
          break;
        case "withdraw":
          stats.totalWithdrawals = item.total;
          break;
        case "purchase":
          stats.totalPurchases = item.total;
          break;
        case "refund":
          stats.totalRefunds = item.total;
          break;
      }
    });

    return stats;
  }

  async adminSearchTransactions(
    filter: IWalletTransactionFilter = {},
    sortOptions: IWalletTransactionSortOptions = { createdAt: -1 },
    limit: number = 20,
    offset: number = 0,
  ): Promise<WalletTransactionSearchResponseDto> {
    const query: any = {};

    if (filter.ownerId) {
      query.ownerId = toObjectId(filter.ownerId);
    }

    if (filter.ownerType) {
      query.ownerType = filter.ownerType;
    }

    if (filter.walletId) {
      query.walletId = toObjectId(filter.walletId);
    }

    if (filter.type) {
      query.type = filter.type;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      query.createdAt = {};
      if (filter.startDate) {
        query.createdAt.$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        query.createdAt.$lte = new Date(filter.endDate);
      }
    }

    const [transactions, total] = await Promise.all([
      this.walletTransactionModel
        .find(query)
        .sort(sortOptions)
        .skip(offset)
        .limit(limit)
        .lean(),
      this.walletTransactionModel.countDocuments(query),
    ]);

    const data = transactions.map((t) => new WalletTransactionDto(t));

    return new WalletTransactionSearchResponseDto(data, total, limit, offset);
  }
}
