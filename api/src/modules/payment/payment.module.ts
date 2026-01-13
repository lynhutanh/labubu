import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { transactionProviders, walletProviders } from "./providers";
import {
  TransactionController,
  ZaloPayController,
  PayPalController,
  WalletController,
  AdminWalletController,
  WalletDepositController,
  SePayController,
  WebhookController,
} from "./controllers";
import {
  TransactionService,
  ZaloPayService,
  PayPalService,
  WalletService,
  WalletTransactionService,
  WalletDepositService,
  SePayService,
} from "./services";
import { UserRegisteredWalletListener } from "./listeners";
import { AuthModule } from "../auth/auth.module";
import { SettingModule } from "../settings/setting.module";
import { OrderModule } from "../orders/order.module";

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => SettingModule),
    forwardRef(() => OrderModule),
  ],
  controllers: [
    TransactionController,
    ZaloPayController,
    PayPalController,
    WalletController,
    AdminWalletController,
    WalletDepositController,
    SePayController,
    WebhookController,
  ],
  providers: [
    ...transactionProviders,
    ...walletProviders,
    TransactionService,
    ZaloPayService,
    PayPalService,
    WalletService,
    WalletTransactionService,
    WalletDepositService,
    SePayService,
    UserRegisteredWalletListener,
  ],
  exports: [
    ...transactionProviders,
    ...walletProviders,
    TransactionService,
    ZaloPayService,
    PayPalService,
    WalletService,
    WalletTransactionService,
    WalletDepositService,
    SePayService,
  ],
})
export class PaymentModule {}
