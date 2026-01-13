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
import { DataResponse } from "src/kernel";
import { STATUS } from "src/kernel/constants";
import { ROLE } from "src/modules/user/constants";
import { UserDto } from "src/modules/user/dtos";
import { UserService } from "src/modules/user/services";
import { SOURCE_TYPE } from "../constants";
import { AccountInactiveException } from "../exceptions";
import { FacebookLoginPayload } from "../payloads";
import { AuthService } from "../services";

@ApiTags("Auth")
@Controller("auth")
export class FacebookLoginController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("facebook/login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: "Login with Facebook OAuth credential" })
  public async facebookLogin(
    @Body() req: FacebookLoginPayload,
  ): Promise<DataResponse<{ token: string; user: any }>> {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      throw new HttpException(
        "Facebook app credentials are not configured",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Verify access token with Facebook Graph API
    let userInfo: any;
    try {
      const verifyUrl = `https://graph.facebook.com/me?access_token=${req.accessToken}&fields=id,name,email,picture`;
      const verifyResponse = await fetch(verifyUrl);

      if (!verifyResponse.ok) {
        throw new HttpException(
          "Invalid Facebook access token",
          HttpStatus.UNAUTHORIZED,
        );
      }

      userInfo = await verifyResponse.json();

      // Verify app_id matches
      const debugUrl = `https://graph.facebook.com/debug_token?input_token=${req.accessToken}&access_token=${appId}|${appSecret}`;
      const debugResponse = await fetch(debugUrl);

      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        if (debugData.data?.app_id !== appId) {
          throw new HttpException(
            "Facebook token app ID mismatch",
            HttpStatus.UNAUTHORIZED,
          );
        }
      }
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to verify Facebook credential",
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!userInfo || !userInfo.email) {
      throw new HttpException(
        "Facebook account does not have a verified email",
        HttpStatus.BAD_REQUEST,
      );
    }

    const facebookId = userInfo.id;
    const email = userInfo.email.toLowerCase();
    const name = userInfo.name || userInfo.email.split("@")[0];

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
      type: "facebook",
      key: facebookId,
      value: userInfo.email,
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
