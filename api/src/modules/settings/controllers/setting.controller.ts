import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { SettingService } from "../services";

@ApiTags("Settings")
@Controller("settings")
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get public settings" })
  async getPublicSettings(): Promise<DataResponse<any>> {
    const settings = await this.settingService.getPublicSettings();
    return DataResponse.ok(settings);
  }
}
