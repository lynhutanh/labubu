import {
  Controller, Get, Post, Param,
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

  @Post("claim/:userPetId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async claimReward(
    @CurrentUser() user: any,
    @Param("userPetId") userPetId: string,
  ): Promise<DataResponse<any>> {
    return DataResponse.ok(await this.petService.claimReward(user._id, userPetId));
  }
}
