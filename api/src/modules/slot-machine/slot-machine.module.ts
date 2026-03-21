import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { slotMachineProviders } from "./providers";
import { AdminSlotMachineController, UserSlotMachineController } from "./controllers";
import { SlotMachineService } from "./services";
import { AuthModule } from "../auth/auth.module";
import { OrderModule } from "../orders/order.module";

@Module({
  imports: [MongoDBModule, forwardRef(() => AuthModule), forwardRef(() => OrderModule)],
  controllers: [AdminSlotMachineController, UserSlotMachineController],
  providers: [...slotMachineProviders, SlotMachineService],
  exports: [...slotMachineProviders, SlotMachineService],
})
export class SlotMachineModule {}
