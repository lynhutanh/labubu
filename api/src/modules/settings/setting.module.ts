import { Module, OnModuleInit, forwardRef } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { settingProviders } from "./providers";
import { SettingService } from "./services";
import { SettingController, AdminSettingController } from "./controllers";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [MongoDBModule, forwardRef(() => AuthModule), forwardRef(() => UserModule)],
  providers: [...settingProviders, SettingService],
  controllers: [SettingController, AdminSettingController],
  exports: [...settingProviders, SettingService],
})
export class SettingModule implements OnModuleInit {
  constructor(private settingService: SettingService) {}

  async onModuleInit() {
    await this.settingService.syncCache();
  }
}
