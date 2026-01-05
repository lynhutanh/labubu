import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DataResponse } from "src/kernel";
import { RoleGuard } from "src/modules/auth/guards";
import { Role } from "src/modules/auth/decorators";
import { ROLE } from "src/modules/user/constants";
import { CategoryService } from "../services";
import {
  CategoryDto,
  CategorySearchResponseDto,
  CategoryStatsDto,
} from "../dtos";
import {
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategorySearchPayload,
  CategoryBulkOperationPayload,
} from "../payloads";

@ApiTags("Admin Categories")
@Controller("admin/categories")
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get("search")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Search categories" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(
    @Query() query: CategorySearchPayload,
  ): Promise<DataResponse<CategorySearchResponseDto>> {
    const result = await this.categoryService.search(query);
    return DataResponse.ok(result);
  }

  @Get("stats")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get category statistics" })
  async getStats(): Promise<DataResponse<CategoryStatsDto>> {
    const stats = await this.categoryService.getStats();
    return DataResponse.ok(stats);
  }

  @Get(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get category by ID" })
  async findById(
    @Param("id") id: string,
  ): Promise<DataResponse<CategoryDto | null>> {
    const category = await this.categoryService.findById(id);
    if (!category) {
      return DataResponse.ok(null);
    }
    return DataResponse.ok(category);
  }

  @Post()
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new category" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() payload: CreateCategoryPayload,
  ): Promise<DataResponse<CategoryDto>> {
    const category = await this.categoryService.create(payload);
    return DataResponse.ok(category);
  }

  @Put(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update category" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param("id") id: string,
    @Body() payload: UpdateCategoryPayload,
  ): Promise<DataResponse<CategoryDto>> {
    const category = await this.categoryService.update(id, payload);
    return DataResponse.ok(category);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete category" })
  async delete(
    @Param("id") id: string,
  ): Promise<DataResponse<{ success: boolean }>> {
    const success = await this.categoryService.delete(id);
    return DataResponse.ok({ success });
  }

  @Post("bulk")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Bulk operation on categories" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkOperation(
    @Body() payload: CategoryBulkOperationPayload,
  ): Promise<DataResponse<{ success: number; failed: number }>> {
    const result = await this.categoryService.bulkOperation(payload);
    return DataResponse.ok(result);
  }
}
