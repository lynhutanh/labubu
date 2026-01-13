import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel/infras";
import { UserService } from "./services";
import { userProviders } from "./providers";
import { AuthModule } from "../auth/auth.module";
import { UserController, AdminUserController } from "./controllers";

@Module({
  imports: [MongoDBModule, forwardRef(() => AuthModule)],
  controllers: [UserController, AdminUserController],
  providers: [...userProviders, UserService],
  exports: [...userProviders, UserService],
})
export class UserModule {}
