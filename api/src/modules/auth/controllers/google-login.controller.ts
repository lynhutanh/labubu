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
    console.log("[Google Login] Starting Google login process");
    console.log("[Google Login] Received credential:", req.credential?.substring(0, 50) + "...");
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    console.log("[Google Login] Client ID configured:", !!clientId);
    
    if (!clientId) {
      console.error("[Google Login] ERROR: Google client ID is not configured");
      throw new HttpException(
        "Google client ID is not configured",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const client = new OAuth2Client(clientId);

    let payload: Record<string, any> | undefined;
    try {
      console.log("[Google Login] Verifying ID token...");
      const ticket = await client.verifyIdToken({
        idToken: req.credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
      console.log("[Google Login] Token verified successfully");
      console.log("[Google Login] Payload:", JSON.stringify(payload, null, 2));
    } catch (error: any) {
      console.error("[Google Login] ERROR verifying token:", error.message);
      throw new HttpException(
        "Invalid Google credential",
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!payload || !payload.email) {
      console.error("[Google Login] ERROR: No email in payload");
      throw new HttpException(
        "Google account does not have a verified email",
        HttpStatus.BAD_REQUEST,
      );
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || payload.email.split("@")[0];
    
    console.log("[Google Login] Email:", email, "Google ID:", googleId);

    let user = await this.userService.findByEmail(email);
    console.log("[Google Login] User found in DB:", !!user);

    if (!user) {
      console.log("[Google Login] Creating new user...");
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
      console.log("[Google Login] New user created:", user._id);
    }

    console.log("[Google Login] User status:", user.status);
    if (user.status === STATUS.INACTIVE) {
      console.error("[Google Login] ERROR: User account is inactive");
      throw new AccountInactiveException();
    }

    console.log("[Google Login] Creating/updating auth record...");
    await this.authService.createOrUpdateAuth({
      source: SOURCE_TYPE.USER,
      sourceId: user._id,
      type: "google",
      key: googleId,
      value: payload.email,
    });
    console.log("[Google Login] Auth record created/updated");

    console.log("[Google Login] Generating auth session token...");
    const expiresInSeconds = 60 * 60 * 24;
    const token = await this.authService.updateAuthSession(
      SOURCE_TYPE.USER,
      user._id,
      expiresInSeconds,
    );
    console.log("[Google Login] Token generated:", token?.substring(0, 50) + "...");

    const userDto = new UserDto(user);
    const userResponse = userDto.toResponse(true);
    userResponse.role = user.role;
    
    console.log("[Google Login] SUCCESS: Login completed for user", user._id);
    console.log("[Google Login] Response:", JSON.stringify({ token: token?.substring(0, 50) + "...", user: userResponse }, null, 2));

    return DataResponse.ok({ token, user: userResponse });
  }
}
