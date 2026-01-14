import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { orderProviders } from "./providers";
import { BuyerOrderController, AdminOrderController } from "./controllers";
import { BuyerOrderService, AdminOrderService } from "./services";
import { OrderCreatedListener, OrderCancelledListener } from "./listeners";
import { AuthModule } from "../auth/auth.module";
import { ProductModule } from "../products/product.module";
import { CartModule } from "../cart/cart.module";
import { PaymentModule } from "../payment/payment.module";
import { SettingModule } from "../settings/setting.module";
import { GhnOrderSyncService } from "./services/ghn-order-sync.service";

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => ProductModule),
    forwardRef(() => CartModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => SettingModule),
  ],
  controllers: [BuyerOrderController, AdminOrderController],
  providers: [
    ...orderProviders,
    BuyerOrderService,
    AdminOrderService,
    OrderCreatedListener,
    OrderCancelledListener,
    GhnOrderSyncService,
  ],
  exports: [
    ...orderProviders,
    BuyerOrderService,
    AdminOrderService,
    GhnOrderSyncService,
  ],
})
export class OrderModule {}
