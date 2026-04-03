import {
  Controller, Get, Post, Param, Query,
  HttpCode, HttpStatus, UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { AuthGuard } from "src/modules/auth/guards";
import { CurrentUser } from "src/modules/auth/decorators";
import { PetService } from "../services";
import { PetFarmDto } from "../dtos";

@ApiTags("Pet")
@Controller("pet")
export class UserPetController {
  constructor(private readonly petService: PetService) {}

  @Get("leaderboard")
  @HttpCode(HttpStatus.OK)
  async getLeaderboard(): Promise<DataResponse<any>> {
    return DataResponse.ok(await this.petService.getLeaderboard(8));
  }

  @Get("farm")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getFarm(@CurrentUser() user: any): Promise<DataResponse<PetFarmDto>> {
    return DataResponse.ok(await this.petService.getFarm(user._id));
  }

  @Get("points")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPoints(@CurrentUser() user: any): Promise<DataResponse<any>> {
    return DataResponse.ok(await this.petService.getTotalPoints(user._id));
  }

  @Get("chest-config")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getChestConfig(@CurrentUser() user: any): Promise<DataResponse<any>> {
    return DataResponse.ok(await this.petService.getChestConfigForUser(user._id));
  }

  @Post("claim/:userPetId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async claimReward(
    @CurrentUser() user: any,
    @Param("userPetId") userPetId: string,
  ): Promise<DataResponse<any>> {
    return DataResponse.ok(await this.petService.claimReward(user._id, userPetId));
  }

  @Post("chest/open")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async openChest(@CurrentUser() user: any): Promise<DataResponse<any>> {
    return DataResponse.ok(await this.petService.openChest(user._id));
  }

  @Get("chest/history")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getChestHistory(
    @CurrentUser() user: any,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ): Promise<DataResponse<any>> {
    return DataResponse.ok(
      await this.petService.getChestHistory(
        user._id,
        Number(page) || 1,
        Number(limit) || 5,
      ),
    );
  }
}
