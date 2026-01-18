import { forwardRef, Module } from "@nestjs/common";
import { MongoDBModule } from "src/kernel/infras";
import { UserService, AddressService } from "./services";
import { userProviders, addressProviders } from "./providers";
import { AuthModule } from "../auth/auth.module";
import { UserController, AdminUserController, AddressController } from "./controllers";

@Module({
  imports: [MongoDBModule, forwardRef(() => AuthModule)],
  controllers: [UserController, AdminUserController, AddressController],
  providers: [...userProviders, ...addressProviders, UserService, AddressService],
  exports: [...userProviders, ...addressProviders, UserService, AddressService],
})
export class UserModule {}
