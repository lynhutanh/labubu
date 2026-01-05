import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { AuthGuard } from "src/modules/auth/guards";
import { CurrentUser } from "src/modules/auth/decorators";
import { TransactionService } from "../services";
import { TransactionDto } from "../dtos";

@ApiTags("Transactions")
@Controller("transactions")
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get current user transactions" })
  async getMyTransactions(
    @CurrentUser() user: any,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
  ): Promise<DataResponse<TransactionDto[]>> {
    const transactions = await this.transactionService.findTransactionsByUserId(
      user._id.toString(),
      limit || 10,
      offset || 0,
    );
    return DataResponse.ok(transactions);
  }

  @Get(":transactionId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get transaction by ID" })
  async getTransaction(
    @Param("transactionId") transactionId: string,
  ): Promise<DataResponse<TransactionDto>> {
    const transaction =
      await this.transactionService.findTransactionById(transactionId);
    return DataResponse.ok(transaction);
  }

  @Get("order/:orderId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get transactions by order ID" })
  async getTransactionsByOrder(
    @Param("orderId") orderId: string,
  ): Promise<DataResponse<TransactionDto[]>> {
    const transactions =
      await this.transactionService.findTransactionsByOrderId(orderId);
    return DataResponse.ok(transactions);
  }
}
