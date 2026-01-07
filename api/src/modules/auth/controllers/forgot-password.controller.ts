import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Controller,
  forwardRef,
  Inject,
  UsePipes,
  ValidationPipe,
  HttpException,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/modules/user/services";
import { DataResponse } from "src/kernel";
import { ForgotPasswordPayload } from "../payloads";
import { AuthService } from "../services";
import { SOURCE_TYPE } from "../constants";
import { SendgridService } from "src/modules/sendgrid/services/sendgrid.service";
import { logError } from "src/lib/utils";
import { STATUS } from "src/kernel/constants";

@ApiTags("Auth")
@Controller("auth")
export class ForgotPasswordController {
  private readonly logger = new Logger("ForgotPasswordController");
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly sendgridService: SendgridService,
    private readonly configService: ConfigService,
  ) {}

  @Post("/forgot-password")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: "Request password reset" })
  async forgotPassword(
    @Body() payload: ForgotPasswordPayload,
  ): Promise<DataResponse<{ message: string }>> {
    this.logger.log("forgot-password request", { email: payload.email });

    const user = await this.userService.findByEmail(payload.email);
    if (!user) {
      this.logger.warn("user not found", { email: payload.email });
      return DataResponse.ok({
        message:
          "Nếu tài khoản tồn tại, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu",
      });
    }

    if (user.status === STATUS.INACTIVE) {
      throw new HttpException(
        "Tài khoản đã bị vô hiệu hóa",
        HttpStatus.FORBIDDEN,
      );
    }

    const authPassword = await this.authService.findBySource({
      sourceId: user._id,
      source: SOURCE_TYPE.USER,
    });

    if (!authPassword) {
      this.logger.warn("authPassword not found", {
        userId: user._id,
        source: SOURCE_TYPE.USER,
      });
      return DataResponse.ok({
        message:
          "Nếu tài khoản tồn tại, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu",
      });
    }

    // Tạo forgot password token
    const token = await this.authService.createForgot(
      SOURCE_TYPE.USER,
      user._id,
      authPassword._id,
    );

    // Generate reset link
    const frontendUrl =
      this.configService.get<string>("app.userUrl") ||
      process.env.FRONTEND_URL ||
      "";
    const frontendUrlClean = frontendUrl.endsWith("/")
      ? frontendUrl.slice(0, -1)
      : frontendUrl || "http://localhost:3000";
    const resetLink = `${frontendUrlClean}/reset-password?token=${token}`;

    // Gửi email bằng Sendgrid
    try {
      const resetTemplateId = this.sendgridService.getPasswordResetTemplateId();

      if (!resetTemplateId) {
        this.logger.warn(
          "SENDGRID_PASSWORD_RESET_TEMPLATE_ID chưa được cấu hình trong .env",
        );
        throw new Error("SENDGRID_PASSWORD_RESET_TEMPLATE_ID not configured");
      }

      const logoUrl = `${frontendUrlClean}/logo.png`;
      const currentYear = new Date().getFullYear().toString();

      this.logger.log("Sending password reset email", {
        to: user.email,
        templateId: resetTemplateId,
        resetLink,
      });

      await this.sendgridService.sendEmail({
        to: user.email,
        templateId: resetTemplateId,
        dynamicTemplateData: {
          logo_url: logoUrl,
          reset_link: resetLink,
          year: currentYear,
          user_name: user.name || user.username,
        },
      });

      this.logger.log("Password reset email sent successfully", {
        userId: user._id,
        email: user.email,
      });
    } catch (error: any) {
      this.logger.error("Failed to send password reset email", {
        userId: user._id,
        email: user.email,
        error: error?.message || error,
      });
      await logError("Failed to send password reset email", error);
    }

    return DataResponse.ok({
      message:
        "Nếu tài khoản tồn tại, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu",
    });
  }
}
