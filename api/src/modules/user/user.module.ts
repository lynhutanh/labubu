import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel/infras";
import { UserService, AddressService } from "./services";
import { userProviders, addressProviders } from "./providers";
import { AuthModule } from "../auth/auth.module";
import { UserController, AdminUserController, AddressController } from "./controllers";
import { UserOrderListener } from "./listeners/user-order.listener";
import { SettingModule } from "../settings/setting.module";
import { VoucherModule } from "../voucher/voucher.module";
import { PaymentModule } from "../payment/payment.module";
import { MemberRankModule } from "../member-rank/member-rank.module";

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => SettingModule),
    forwardRef(() => VoucherModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => MemberRankModule),
  ],
  controllers: [UserController, AdminUserController, AddressController],
  providers: [
    ...userProviders,
    ...addressProviders,
    UserService,
    AddressService,
    UserOrderListener,
  ],
  exports: [...userProviders, ...addressProviders, UserService, AddressService],
})
export class UserModule { }
