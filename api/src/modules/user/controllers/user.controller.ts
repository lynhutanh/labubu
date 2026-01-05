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
import { WalletService } from "src/modules/payment/services";
import { WALLET_OWNER_TYPE } from "src/modules/payment/constants";

@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
  ) {}

  @Get("me")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@CurrentUser() user: UserDto): Promise<DataResponse<any>> {
    const userProfile = await this.userService.findById(user._id.toString());
    const wallet = await this.walletService.findByOwner(
      user._id.toString(),
      WALLET_OWNER_TYPE.USER,
    );

    return DataResponse.ok({
      ...userProfile.toResponse(true),
      wallet: wallet
        ? {
            balance: wallet.balance,
            currency: wallet.currency,
            status: wallet.status,
          }
        : null,
    });
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
    const wallet = await this.walletService.findByOwner(
      user._id.toString(),
      WALLET_OWNER_TYPE.USER,
    );

    return DataResponse.ok({
      ...updatedUser.toResponse(true),
      wallet: wallet
        ? {
            balance: wallet.balance,
            currency: wallet.currency,
            status: wallet.status,
          }
        : null,
    });
  }
}
