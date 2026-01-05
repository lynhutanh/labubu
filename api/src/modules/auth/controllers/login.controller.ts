import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Controller,
  HttpException,
  forwardRef,
  Inject,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { UserService } from "src/modules/user/services";
import { UserDto } from "src/modules/user/dtos";
import { DataResponse } from "src/kernel";
import { STATUS } from "src/kernel/constants";
import { LoginByUsernamePayload } from "../payloads";
import { AuthService } from "../services";
import {
  PasswordIncorrectException,
  AccountInactiveException,
} from "../exceptions";
import { SOURCE_TYPE } from "../constants";

@ApiTags("Auth")
@Controller("auth")
export class LoginController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: "Login with username/email and password" })
  public async login(
    @Body() req: LoginByUsernamePayload,
  ): Promise<DataResponse<{ token: string }>> {
    const user =
      (await this.userService.findByEmail(req.username)) ||
      (await this.userService.findByUsername(req.username));

    if (!user) {
      throw new HttpException("This account is not found. Please sign up", 404);
    }

    const authPassword = await this.authService.findBySource({
      sourceId: user._id,
      source: SOURCE_TYPE.USER,
    });

    if (!authPassword) {
      throw new HttpException("This account is not found. Please sign up", 404);
    }

    if (user.status === STATUS.INACTIVE) {
      throw new AccountInactiveException();
    }

    if (!this.authService.verifyPassword(req.password, authPassword)) {
      throw new PasswordIncorrectException();
    }

    const expiresIn = req.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 1;
    const token = await this.authService.updateAuthSession(
      SOURCE_TYPE.USER,
      user._id,
      expiresIn,
    );

    const userDto = new UserDto(user);
    const userResponse = userDto.toResponse(true);
    userResponse.role = user.role;

    return DataResponse.ok({ token, user: userResponse });
  }
}
