import {
  Body,
  Controller,
  forwardRef,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { OAuth2Client } from "google-auth-library";
import { DataResponse } from "src/kernel";
import { STATUS } from "src/kernel/constants";
import { ROLE } from "src/modules/user/constants";
import { UserDto } from "src/modules/user/dtos";
import { UserService } from "src/modules/user/services";
import { SOURCE_TYPE } from "../constants";
import { AccountInactiveException } from "../exceptions";
import { GoogleLoginPayload } from "../payloads";
import { AuthService } from "../services";

@ApiTags("Auth")
@Controller("auth")
export class GoogleLoginController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("google/login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: "Login with Google OAuth credential" })
  public async googleLogin(
    @Body() req: GoogleLoginPayload,
  ): Promise<DataResponse<{ token: string }>> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new HttpException(
        "Google client ID is not configured",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const client = new OAuth2Client(clientId);

    let payload: Record<string, any> | undefined;
    try {
      const ticket = await client.verifyIdToken({
        idToken: req.credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new HttpException(
        "Invalid Google credential",
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!payload || !payload.email) {
      throw new HttpException(
        "Google account does not have a verified email",
        HttpStatus.BAD_REQUEST,
      );
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || payload.email.split("@")[0];

    let user = await this.userService.findByEmail(email);

    if (!user) {
      const baseUsername = email.split("@")[0];
      let username = baseUsername;
      let suffix = 1;

      // Ensure username uniqueness
      while (await this.userService.findByUsername(username)) {
        username = `${baseUsername}${suffix}`;
        suffix += 1;
      }

      user = await this.userService.register({
        username,
        email,
        name,
        role: ROLE.USER,
      });
    }

    if (user.status === STATUS.INACTIVE) {
      throw new AccountInactiveException();
    }

    await this.authService.createOrUpdateAuth({
      source: SOURCE_TYPE.USER,
      sourceId: user._id,
      type: "google",
      key: googleId,
      value: payload.email,
    });

    const expiresInSeconds = 60 * 60 * 24;
    const token = await this.authService.updateAuthSession(
      SOURCE_TYPE.USER,
      user._id,
      expiresInSeconds,
    );

    const userDto = new UserDto(user);
    const userResponse = userDto.toResponse(true);
    userResponse.role = user.role;

    return DataResponse.ok({ token, user: userResponse });
  }
}
