import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Controller,
  forwardRef,
  Inject,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { UserService } from "src/modules/user/services";
import { DataResponse } from "src/kernel";
import { UserRegisterPayload } from "../payloads";
import { AuthService } from "../services";
import { AuthCreateDto } from "../dtos";
import { SOURCE_TYPE } from "../constants";

@ApiTags("Auth")
@Controller("auth")
export class UserRegisterController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("/users/register")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Register new user account" })
  async userRegister(
    @Body() payload: UserRegisterPayload,
  ): Promise<DataResponse<{ message: string }>> {
    const user = await this.userService.register(payload);
    await Promise.all([
      this.authService.create(
        new AuthCreateDto({
          source: SOURCE_TYPE.USER,
          sourceId: user._id,
          type: "email",
          value: payload.password,
          key: user.email,
        }),
      ),
      this.authService.create(
        new AuthCreateDto({
          source: SOURCE_TYPE.USER,
          sourceId: user._id,
          type: "username",
          value: payload.password,
          key: user.username,
        }),
      ),
    ]);

    const token = this.authService.generateJWT();

    return DataResponse.ok({
      message: "Register success",
      token,
    });
  }
}
