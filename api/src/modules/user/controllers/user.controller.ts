import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { CurrentUser } from "src/modules/auth/decorators";
import { AuthGuard } from "src/modules/auth/guards";
import { UserDto } from "../dtos";
import { UserService, IUserUpdatePayload } from "../services";

@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get("me")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@CurrentUser() user: UserDto): Promise<DataResponse<any>> {
    const userProfile = await this.userService.findById(user._id.toString());
    return DataResponse.ok(userProfile.toResponse(true));
  }

  @Put("me")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update current user profile" })
  async updateProfile(
    @CurrentUser() user: UserDto,
    @Body() payload: IUserUpdatePayload,
  ): Promise<DataResponse<any>> {
    const updatedUser = await this.userService.updateUser(user, payload);
    return DataResponse.ok(updatedUser.toResponse(true));
  }
}
