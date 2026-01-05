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
import { EVENT } from "src/kernel/constants";
import { TransactionModel } from "../models";
import {
  TransactionDto,
  CreateTransactionDto,
  UpdateTransactionDto,
} from "../dtos";
import { TRANSACTION_MODEL_PROVIDER } from "../providers";
import { TRANSACTION_STATUS, PAYMENT_CHANNELS } from "../constants";
import { ITransactionUpdateData } from "../interfaces";

@Injectable()
export class TransactionService {
  constructor(
    @Inject(TRANSACTION_MODEL_PROVIDER)
    private readonly transactionModel: Model<TransactionModel>,
    private readonly queueEventService: QueueMessageService,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    session?: ClientSession,
  ): Promise<TransactionDto> {
    try {
      const transactionId = `TXN_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`;

      const transactionData = {
        ...createTransactionDto,
        transactionId,
        status: TRANSACTION_STATUS.PENDING,
      };

      const transaction = new this.transactionModel(transactionData);
      const savedTransaction = await transaction.save({ session });

      return new TransactionDto(savedTransaction.toObject());
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(
        `Failed to create transaction: ${errorMessage}`,
      );
    }
  }

  async updateTransaction(
    transactionId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionDto> {
    try {
      const updatedTransaction = await this.transactionModel
        .findByIdAndUpdate(
          toObjectId(transactionId),
          { $set: updateTransactionDto },
          { new: true },
        )
        .lean();

      if (!updatedTransaction) {
        throw new NotFoundException(
          `Không tìm thấy giao dịch: ${transactionId}`,
        );
      }

      if (updateTransactionDto.status === TRANSACTION_STATUS.COMPLETED) {
        await this.queueEventService.publish(PAYMENT_CHANNELS.PAYMENT_SUCCESS, {
          channel: PAYMENT_CHANNELS.PAYMENT_SUCCESS,
          eventName: EVENT.UPDATED,
          data: {
            transactionId: updatedTransaction.transactionId,
          },
        });
      }

      return new TransactionDto(updatedTransaction);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(
        `Failed to update transaction: ${errorMessage}`,
      );
    }
  }

  async findTransactionById(transactionId: string): Promise<TransactionDto> {
    try {
      const transaction = await this.transactionModel
        .findOne({ transactionId })
        .lean();

      if (!transaction) {
        throw new NotFoundException(
          `Không tìm thấy giao dịch: ${transactionId}`,
        );
      }

      return new TransactionDto(transaction);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(
        `Failed to find transaction: ${errorMessage}`,
      );
    }
  }

  async findTransactionsByOrderId(orderId: string): Promise<TransactionDto[]> {
    try {
      const transactions = await this.transactionModel
        .find({ orderId })
        .sort({ createdAt: -1 })
        .lean();

      return transactions.map((transaction) => new TransactionDto(transaction));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(
        `Failed to find transactions: ${errorMessage}`,
      );
    }
  }

  async findTransactionsByUserId(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<TransactionDto[]> {
    try {
      const transactions = await this.transactionModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

      return transactions.map((transaction) => new TransactionDto(transaction));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(
        `Failed to find transactions: ${errorMessage}`,
      );
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    status: string,
    session?: ClientSession,
  ): Promise<TransactionDto> {
    try {
      const updateData: ITransactionUpdateData = { status };

      if (status === TRANSACTION_STATUS.COMPLETED) {
        updateData.completedAt = new Date();
      }

      if (
        status === TRANSACTION_STATUS.FAILED ||
        status === TRANSACTION_STATUS.CANCELLED
      ) {
        updateData.failedAt = new Date();
      }

      const updatedTransaction = await this.transactionModel
        .findOneAndUpdate(
          { transactionId },
          { $set: updateData },
          { new: true, session },
        )
        .lean();

      if (!updatedTransaction) {
        throw new NotFoundException(
          `Không tìm thấy giao dịch: ${transactionId}`,
        );
      }

      if (status === TRANSACTION_STATUS.COMPLETED) {
        await this.queueEventService.publish(PAYMENT_CHANNELS.PAYMENT_SUCCESS, {
          channel: PAYMENT_CHANNELS.PAYMENT_SUCCESS,
          eventName: EVENT.UPDATED,
          data: {
            transactionId: updatedTransaction.transactionId,
          },
        });
      }

      return new TransactionDto(updatedTransaction);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(
        `Failed to update transaction status: ${errorMessage}`,
      );
    }
  }

  async findTransactionByExternalId(
    externalTransactionId: string,
  ): Promise<TransactionDto | null> {
    try {
      const transaction = await this.transactionModel
        .findOne({ externalTransactionId })
        .lean();

      if (!transaction) {
        return null;
      }

      return new TransactionDto(transaction);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(
        `Failed to find transaction by external ID: ${errorMessage}`,
      );
    }
  }

  async findTransactionByPayPalOrderId(
    paypalOrderId: string,
  ): Promise<TransactionDto | null> {
    try {
      const transaction = await this.transactionModel
        .findOne({
          $or: [
            { externalTransactionId: paypalOrderId },
            { "providerData.paypalOrderId": paypalOrderId },
          ],
        })
        .lean();

      if (!transaction) {
        return null;
      }

      return new TransactionDto(transaction);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(
        `Failed to find transaction by PayPal order ID: ${errorMessage}`,
      );
    }
  }

  async findTransactionByOrderNumber(
    orderNumber: string,
  ): Promise<TransactionDto | null> {
    try {
      const transaction = await this.transactionModel
        .findOne({ orderNumber, paymentMethod: "paypal" })
        .sort({ createdAt: -1 })
        .lean();

      if (!transaction) {
        return null;
      }

      return new TransactionDto(transaction);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(
        `Failed to find transaction by order number: ${errorMessage}`,
      );
    }
  }
}
