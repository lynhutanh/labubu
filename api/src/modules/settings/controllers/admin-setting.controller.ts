import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { Role } from "src/modules/auth/decorators";
import { RoleGuard } from "src/modules/auth/guards";
import { ROLE } from "src/modules/user/constants";
import { SettingService } from "../services";

@ApiTags("Admin Settings")
@Controller("admin/settings")
export class AdminSettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin get all settings" })
  @ApiQuery({ name: "group", required: false })
  async getAllSettings(
    @Query("group") group?: string,
  ): Promise<DataResponse<any>> {
    const settings = await this.settingService.getEditableSettings(group);
    return DataResponse.ok(settings);
  }

  @Put(":key")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin update setting" })
  async updateSetting(
    @Param("key") key: string,
    @Body() body: { value: any },
  ): Promise<DataResponse<any>> {
    await this.settingService.set(key, body.value);
    return DataResponse.ok({ message: "Setting updated" });
  }
}
