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
  HttpException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { Role } from "src/modules/auth/decorators";
import { RoleGuard } from "src/modules/auth/guards";
import { ROLE } from "src/modules/user/constants";
import { SettingService } from "../services";
import { AuthService } from "src/modules/auth/services";
import { AuthCreateDto } from "src/modules/auth/dtos";
import { UserService } from "src/modules/user/services";

@ApiTags("Admin Settings")
@Controller("admin/settings")
export class AdminSettingController {
  constructor(
    private readonly settingService: SettingService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) { }

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
    if (key === "adminConfirmPassword" && body.value) {
      const newPassword = await this.settingService.get("adminNewPassword");

      if (!newPassword) {
        throw new HttpException(
          "Vui lòng nhập mật khẩu mới trước",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (newPassword !== body.value) {
        throw new HttpException(
          "Mật khẩu xác nhận không khớp",
          HttpStatus.BAD_REQUEST,
        );
      }

      const adminUser = await this.userService.findOneEvolution({
        role: ROLE.ADMIN,
      });

      if (!adminUser) {
        throw new HttpException(
          "Không tìm thấy tài khoản admin",
          HttpStatus.NOT_FOUND,
        );
      }

      await Promise.all([
        this.authService.create(
          new AuthCreateDto({
            source: "user",
            sourceId: adminUser._id,
            type: "email",
            value: newPassword,
            key: adminUser.email,
          }),
        ),
        this.authService.create(
          new AuthCreateDto({
            source: "user",
            sourceId: adminUser._id,
            type: "username",
            value: newPassword,
            key: adminUser.username,
          }),
        ),
      ]);

      await this.settingService.set("adminNewPassword", "");
      await this.settingService.set("adminConfirmPassword", "");

      return DataResponse.ok({ message: "Đổi mật khẩu thành công" });
    }

    if (key === "welcome_popup") {
      await this.settingService.set(key, body.value, {
        name: "Welcome Popup",
        description: "Thông báo nổi lên khi người dùng vào trang chủ",
        public: true,
        visible: true,
        editable: true,
        group: "general",
      });
      return DataResponse.ok({ message: "Welcome popup configuration updated" });
    }

    await this.settingService.set(key, body.value);
    return DataResponse.ok({ message: "Setting updated" });
  }
}
