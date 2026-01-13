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
  GoogleLoginController,
  FacebookLoginController,
} from "./controllers";
import { AuthGuard, LoadUser, RoleGuard } from "./guards";
import { authProviders } from "./providers";
import { SendgridModule } from "../sendgrid/sendgrid.module";

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => UserModule),
    EmailModule,
    SendgridModule,
  ],
  controllers: [
    LoginController,
    UserRegisterController,
    ForgotPasswordController,
    ResetPasswordController,
    GoogleLoginController,
    FacebookLoginController,
  ],
  providers: [AuthService, AuthGuard, RoleGuard, LoadUser, ...authProviders],
  exports: [AuthService, AuthGuard, RoleGuard, LoadUser],
})
export class AuthModule {}
