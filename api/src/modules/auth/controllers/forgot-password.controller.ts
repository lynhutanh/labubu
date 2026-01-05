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
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/modules/user/services";
import { DataResponse } from "src/kernel";
import { ForgotPasswordPayload } from "../payloads";
import { AuthService } from "../services";
import { EmailService } from "src/modules/email/services/email.service";
import { SOURCE_TYPE } from "../constants";

@ApiTags("Auth")
@Controller("auth")
export class ForgotPasswordController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @Post("/forgot-password")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: "Request password reset" })
  async forgotPassword(
    @Body() payload: ForgotPasswordPayload,
  ): Promise<DataResponse<{ message: string }>> {
    const user = await this.userService.findByEmail(payload.email);

    if (!user) {
      // Don't reveal if email exists or not for security
      return DataResponse.ok({
        message:
          "If that email exists, we've sent a password reset link to it.",
      });
    }

    const authPassword = await this.authService.findBySource({
      sourceId: user._id,
      source: SOURCE_TYPE.USER,
    });

    if (!authPassword) {
      return DataResponse.ok({
        message:
          "If that email exists, we've sent a password reset link to it.",
      });
    }

    // Create forgot password token
    const token = await this.authService.createForgot(
      SOURCE_TYPE.USER,
      user._id,
      authPassword._id,
    );

    // Generate reset link
    const frontendUrl =
      process.env.FRONTEND_URL ||
      this.configService.get<string>("app.userUrl") ||
      "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Send email
    try {
      await this.emailService.sendResetPasswordEmail(
        user.email,
        resetLink,
        user.name || user.username,
      );
    } catch (error) {
      console.error("Error sending reset password email:", error);
      // Still return success to not reveal email issues
    }

    return DataResponse.ok({
      message:
        "If that email exists, we've sent a password reset link to it.",
    });
  }
}

