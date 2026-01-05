import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { CurrentUser, Role } from "src/modules/auth/decorators";
import { AuthGuard, RoleGuard } from "src/modules/auth/guards";
import { ROLE } from "src/modules/user/constants";
import { WalletService, WalletTransactionService } from "../services";
import {
  DepositPayload,
  WithdrawPayload,
  WalletTransactionSearchPayload,
} from "../payloads";
import { WALLET_OWNER_TYPE } from "../constants";

@ApiTags("Wallet")
@Controller("wallet")
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly walletTransactionService: WalletTransactionService,
  ) {}

  @Get("balance")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy số dư ví" })
  async getBalance(@CurrentUser() user: any): Promise<DataResponse<any>> {
    const ownerId = user._id.toString();
    const balance = await this.walletService.getBalance(
      ownerId,
      WALLET_OWNER_TYPE.USER,
    );
    return DataResponse.ok(balance);
  }

  @Get("stats")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy thống kê ví" })
  async getStats(@CurrentUser() user: any): Promise<DataResponse<any>> {
    const ownerId = user._id.toString();
    const stats = await this.walletService.getStats(
      ownerId,
      WALLET_OWNER_TYPE.USER,
    );
    return DataResponse.ok(stats);
  }

  @Post("deposit")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Nạp tiền vào ví" })
  async deposit(
    @CurrentUser() user: any,
    @Body() payload: DepositPayload,
  ): Promise<DataResponse<any>> {
    const ownerId = user._id.toString();
    const wallet = await this.walletService.deposit(
      ownerId,
      WALLET_OWNER_TYPE.USER,
      {
        amount: payload.amount,
        description: payload.description,
      },
    );
    return DataResponse.ok(wallet);
  }

  @Post("withdraw")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rút tiền từ ví" })
  async withdraw(
    @CurrentUser() user: any,
    @Body() payload: WithdrawPayload,
  ): Promise<DataResponse<any>> {
    const ownerId = user._id.toString();
    const wallet = await this.walletService.withdraw(
      ownerId,
      WALLET_OWNER_TYPE.USER,
      {
        amount: payload.amount,
        description: payload.description,
        metadata: {
          bankAccount: payload.bankAccount,
          bankName: payload.bankName,
          accountHolderName: payload.accountHolderName,
        },
      },
    );
    return DataResponse.ok(wallet);
  }

  @Get("transactions")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy lịch sử giao dịch" })
  async getTransactions(
    @CurrentUser() user: any,
    @Query() query: WalletTransactionSearchPayload,
  ): Promise<DataResponse<any>> {
    const ownerId = user._id.toString();
    const sortOptions: any = {};
    if (query.sortBy) {
      sortOptions[query.sortBy] = query.sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const result = await this.walletTransactionService.getTransactionHistory(
      ownerId,
      WALLET_OWNER_TYPE.USER,
      {
        type: query.type,
        status: query.status,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      },
      sortOptions,
      query.limit || 20,
      query.offset || 0,
    );
    return DataResponse.ok(result);
  }

  @Get("transactions/recent")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy giao dịch gần đây" })
  async getRecentTransactions(
    @CurrentUser() user: any,
    @Query("limit") limit?: number,
  ): Promise<DataResponse<any>> {
    const ownerId = user._id.toString();
    const transactions =
      await this.walletTransactionService.getRecentTransactions(
        ownerId,
        WALLET_OWNER_TYPE.USER,
        limit || 10,
      );
    return DataResponse.ok(transactions);
  }

  @Get("transactions/stats")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy thống kê giao dịch" })
  async getTransactionStats(
    @CurrentUser() user: any,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ): Promise<DataResponse<any>> {
    const ownerId = user._id.toString();
    const stats = await this.walletTransactionService.getTransactionStats(
      ownerId,
      WALLET_OWNER_TYPE.USER,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return DataResponse.ok(stats);
  }
}

@ApiTags("Admin Wallet")
@Controller("admin/wallet")
export class AdminWalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly walletTransactionService: WalletTransactionService,
  ) {}

  @Get("system/stats")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Lấy thống kê ví hệ thống" })
  async getSystemWalletStats(): Promise<DataResponse<any>> {
    const stats = await this.walletService.getSystemWalletStats();
    return DataResponse.ok(stats);
  }

  @Get("transactions")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Tìm kiếm tất cả giao dịch" })
  async searchTransactions(
    @Query()
    query: WalletTransactionSearchPayload & {
      ownerId?: string;
      ownerType?: string;
    },
  ): Promise<DataResponse<any>> {
    const sortOptions: any = {};
    if (query.sortBy) {
      sortOptions[query.sortBy] = query.sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const result = await this.walletTransactionService.adminSearchTransactions(
      {
        ownerId: query.ownerId,
        ownerType: query.ownerType,
        type: query.type,
        status: query.status,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      },
      sortOptions,
      query.limit || 20,
      query.offset || 0,
    );
    return DataResponse.ok(result);
  }

  @Post("freeze/:walletId")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đóng băng ví" })
  async freezeWallet(
    @Query("walletId") walletId: string,
  ): Promise<DataResponse<any>> {
    const wallet = await this.walletService.freezeWallet(walletId);
    return DataResponse.ok(wallet);
  }

  @Post("unfreeze/:walletId")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mở đóng băng ví" })
  async unfreezeWallet(
    @Query("walletId") walletId: string,
  ): Promise<DataResponse<any>> {
    const wallet = await this.walletService.unfreezeWallet(walletId);
    return DataResponse.ok(wallet);
  }

  @Post("system/init")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Khởi tạo ví hệ thống" })
  async initSystemWallet(): Promise<DataResponse<any>> {
    const wallet = await this.walletService.getOrCreateSystemWallet();
    return DataResponse.ok(wallet);
  }
}
