import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { spinProviders } from "./providers";
import { AdminSpinController, UserSpinController } from "./controllers";
import { SpinService } from "./services";
import { AuthModule } from "../auth/auth.module";
import { OrderModule } from "../orders/order.module";

@Module({
  imports: [MongoDBModule, forwardRef(() => AuthModule), forwardRef(() => OrderModule)],
  controllers: [AdminSpinController, UserSpinController],
  providers: [...spinProviders, SpinService],
  exports: [...spinProviders, SpinService],
})
export class SpinModule {}
