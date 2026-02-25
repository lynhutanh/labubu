import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule }from "src/kernel";
import { voucherProviders }from "./providers";
import { AdminVoucherController, UserVoucherController } from "./controllers";
import { VoucherService } from "./services";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [MongoDBModule, forwardRef(() => AuthModule)],
  controllers: [AdminVoucherController, UserVoucherController],
  providers: [...voucherProviders, VoucherService],
  exports: [...voucherProviders, VoucherService],
})
export class VoucherModule {}
