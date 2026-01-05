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
import { BrandService } from "../services";
import { BrandDto, BrandSearchResponseDto, BrandStatsDto } from "../dtos";
import {
  CreateBrandPayload,
  UpdateBrandPayload,
  BrandSearchPayload,
  BrandBulkOperationPayload,
} from "../payloads";

@ApiTags("Admin Brands")
@Controller("admin/brands")
export class AdminBrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get("search")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Search brands" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(
    @Query() query: BrandSearchPayload,
  ): Promise<DataResponse<BrandSearchResponseDto>> {
    const result = await this.brandService.search(query);
    return DataResponse.ok(result);
  }

  @Get("stats")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get brand statistics" })
  async getStats(): Promise<DataResponse<BrandStatsDto>> {
    const stats = await this.brandService.getStats();
    return DataResponse.ok(stats);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all brands" })
  async getAll(): Promise<DataResponse<BrandDto[]>> {
    const brands = await this.brandService.getAll();
    return DataResponse.ok(brands);
  }

  @Get(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get brand by ID" })
  async findById(
    @Param("id") id: string,
  ): Promise<DataResponse<BrandDto | null>> {
    const brand = await this.brandService.findById(id);
    if (!brand) {
      return DataResponse.ok(null);
    }
    return DataResponse.ok(brand);
  }

  @Post()
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new brand" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() payload: CreateBrandPayload,
  ): Promise<DataResponse<BrandDto>> {
    try {
      const brand = await this.brandService.create(payload);
      return DataResponse.ok(brand);
    } catch (error) {
      throw error;
    }
  }

  @Put(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update brand" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param("id") id: string,
    @Body() payload: UpdateBrandPayload,
  ): Promise<DataResponse<BrandDto>> {
    const brand = await this.brandService.update(id, payload);
    return DataResponse.ok(brand);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete brand" })
  async delete(
    @Param("id") id: string,
  ): Promise<DataResponse<{ success: boolean }>> {
    const success = await this.brandService.delete(id);
    return DataResponse.ok({ success });
  }

  @Post("bulk")
  @UseGuards(RoleGuard)
  @Role(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Bulk operation on brands" })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkOperation(
    @Body() payload: BrandBulkOperationPayload,
  ): Promise<DataResponse<{ success: number; failed: number }>> {
    const result = await this.brandService.bulkOperation(payload);
    return DataResponse.ok(result);
  }
}
