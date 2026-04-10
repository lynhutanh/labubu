import { Module, forwardRef } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { BackupService } from "./backup.service";
import { AdminBackupController } from "./controllers";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [MongoDBModule, forwardRef(() => AuthModule)],
  providers: [BackupService],
  controllers: [AdminBackupController],
})
export class BackupModule {}
