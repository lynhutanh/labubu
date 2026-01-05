import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Controller,
  UsePipes,
  ValidationPipe,
  HttpException,
  forwardRef,
  Inject,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { ResetPasswordPayload } from "../payloads";
import { AuthService } from "../services";
import { AuthCreateDto } from "../dtos";
import { SOURCE_TYPE } from "../constants";
import { UserService } from "src/modules/user/services";

@ApiTags("Auth")
@Controller("auth")
export class ResetPasswordController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @Post("/reset-password")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: "Reset password with token" })
  async resetPassword(
    @Body() payload: ResetPasswordPayload,
  ): Promise<DataResponse<{ message: string }>> {
    // Find forgot token
    const forgot = await this.authService.findByForgotToken(payload.token);

    if (!forgot) {
      throw new HttpException(
        "Invalid or expired reset token. Please request a new one.",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Get user to update email/username key
    const user = await this.userService.findById(forgot.sourceId.toString());
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    // Update password for both email and username auth
    await Promise.all([
      this.authService.create(
        new AuthCreateDto({
          source: forgot.source,
          sourceId: forgot.sourceId,
          type: "email",
          value: payload.password,
          key: user.email,
        }),
      ),
      this.authService.create(
        new AuthCreateDto({
          source: forgot.source,
          sourceId: forgot.sourceId,
          type: "username",
          value: payload.password,
          key: user.username,
        }),
      ),
    ]);

    // Delete the forgot token (one-time use)
    await this.authService.deleteForgot(payload.token);

    return DataResponse.ok({
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  }
}

