import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  forwardRef,
  Inject,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { Role } from "src/modules/auth/decorators";
import { RoleGuard } from "src/modules/auth/guards";
import { AuthService } from "src/modules/auth/services";
import { AuthCreateDto } from "src/modules/auth/dtos";
import { SOURCE_TYPE } from "src/modules/auth/constants";
import { ROLE } from "../constants";
import { UserService } from "../services";
import { CreateUserPayload, UpdateUserPayload } from "../payloads";

@ApiTags("Admin Users")
@Controller("admin/users")
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

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

  @Post()
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Admin create user" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createUser(
    @Body() payload: CreateUserPayload,
  ): Promise<DataResponse<any>> {
    const user = await this.userService.adminCreate(payload);

    // Create auth credentials if password is provided
    if (payload.password) {
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
    }

    return DataResponse.ok(user.toResponse(true, true));
  }

  @Put(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin update user" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateUser(
    @Param("id") id: string,
    @Body() payload: UpdateUserPayload,
  ): Promise<DataResponse<any>> {
    const user = await this.userService.adminUpdate(id, payload);
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
