import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { Role } from "src/modules/auth/decorators";
import { RoleGuard } from "src/modules/auth/guards";
import { ROLE } from "../constants";
import { UserService } from "../services";

@ApiTags("Admin Users")
@Controller("admin/users")
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin search users" })
  async search(
    @Query()
    query: {
      q?: string;
      role?: string;
      status?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<DataResponse<any>> {
    const result = await this.userService.search(query);
    return DataResponse.ok(result);
  }

  @Get(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin get user by id" })
  async getUser(@Param("id") id: string): Promise<DataResponse<any>> {
    const user = await this.userService.findById(id);
    return DataResponse.ok(user?.toResponse(true, true));
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin delete user" })
  async deleteUser(@Param("id") id: string): Promise<DataResponse<boolean>> {
    const result = await this.userService.delete(id);
    return DataResponse.ok(result);
  }
}
