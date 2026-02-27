import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { orderProviders, refundRequestProviders } from "./providers";
import { BuyerOrderController, AdminOrderController, RefundRequestController } from "./controllers";
import { BuyerOrderService, AdminOrderService, RefundRequestService } from "./services";
import { OrderCreatedListener, OrderCancelledListener } from "./listeners";
import { PublicOrderController } from "./controllers/public-order.controller";
import { AuthModule } from "../auth/auth.module";
import { ProductModule } from "../products/product.module";
import { CartModule } from "../cart/cart.module";
import { PaymentModule } from "../payment/payment.module";
import { SettingModule } from "../settings/setting.module";
import { SendgridModule } from "../sendgrid/sendgrid.module";
import { UserModule } from "../user/user.module";
import { VoucherModule } from "../voucher/voucher.module";
import { GhnOrderSyncService } from "./services/ghn-order-sync.service";

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => ProductModule),
    forwardRef(() => CartModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => SettingModule),
    SendgridModule,
    forwardRef(() => UserModule),
    forwardRef(() => VoucherModule),
  ],
  controllers: [BuyerOrderController, AdminOrderController, RefundRequestController, PublicOrderController],
  providers: [
    ...orderProviders,
    ...refundRequestProviders,
    BuyerOrderService,
    AdminOrderService,
    RefundRequestService,
    OrderCreatedListener,
    OrderCancelledListener,
    GhnOrderSyncService,
  ],
  exports: [
    ...orderProviders,
    ...refundRequestProviders,
    BuyerOrderService,
    AdminOrderService,
    RefundRequestService,
    GhnOrderSyncService,
  ],
})
export class OrderModule { }
