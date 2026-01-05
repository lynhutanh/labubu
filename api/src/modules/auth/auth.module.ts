import { Module, forwardRef } from "@nestjs/common";
import { MongoDBModule } from "src/kernel";
import { UserModule } from "../user/user.module";
import { EmailModule } from "../email/email.module";
import { AuthService } from "./services";
import {
  LoginController,
  UserRegisterController,
  ForgotPasswordController,
  ResetPasswordController,
} from "./controllers";
import { AuthGuard, LoadUser, RoleGuard } from "./guards";
import { authProviders } from "./providers";

@Module({
  imports: [MongoDBModule, forwardRef(() => UserModule), EmailModule],
  controllers: [
    LoginController,
    UserRegisterController,
    ForgotPasswordController,
    ResetPasswordController,
  ],
  providers: [AuthService, AuthGuard, RoleGuard, LoadUser, ...authProviders],
  exports: [AuthService, AuthGuard, RoleGuard, LoadUser],
})
export class AuthModule {}
